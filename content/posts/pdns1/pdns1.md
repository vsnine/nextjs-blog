---
title: "DNS Problems"
description: Leverage Cloudflare and PowerDNS inside the lab.
date: 2021-04-24T12:00:00.000Z
---

## The problem

After recently setting up this blog at Cloudflare Pages, I was having trouble reaching it internally as I had setup a split horizon DNS. The external zone had moved to Cloudflare a few years ago, which was fine as the domain was mostly handling email and I didn't have any external websites.

I like being able to use the internal DNS view to have internal services, but since the page is hosted in CF Pages there is no IP address I can put into DNS. Fortunately I learned that they provide CNAME records for all hostnames, which are automatically updated by the Cloudflare network. 

## CNAMEs for everyone
To use this, append your actual hostname with `.cdn.cloudflare.net`, so in my case, it is `www.vsnine.org.cdn.cloudflare.net`. Their edge will route the traffic as long as the host header the client is using matches what's set in DNS.

That's nice, but what about `vsnine.org`? An issue I face here is that you can't use a CNAME record as the target of a DNS zone's origin or apex record. I could have tried to manually add the same Cloudflare IPs to my private DNS, but there is the chance the IPs could change sometime down the road, and that could get annoying.

This ISC blog goes into more details and was quite useful: [ISC Blog: CNAME at the apex of a zone](https://www.isc.org/blogs/cname-at-the-apex-of-a-zone/) It lists a number of potential options and weighs the pros and cons. It describes how RFC1034 states that a CNAME record cannot be shared by any other types, so while a CNAME apex could technically work, it likely won't work well, or have undesired results. 

In my case, I'll be using alternative #4: the ALIAS record type.

## So what next?
My internal DNS service is provided by a PowerDNS server, which I found does support use of the ALIAS record type pointed to a CNAME. More info on this is available in the docs here: [PowerDNS: Using ALIAS records](https://doc.powerdns.com/authoritative/guides/alias.html)

Some other products and providers support CNAME flattening, you will need to check the docs for support. Notably, BIND does not support dynamically setting an ALIAS record, so other methods would be needed, which I mention later..

## Let's fix it!
Simply put, PowerDNS needs the `expand-alias` flag set to yes, and the field `resolver` set to use some DNS server to be able to transform the CNAME into an A record response. As the note in the PowerDNS guide says, if the resolver isn't specified, this feature won't work. Also I imagine it would begin to fail if that resolver became unavailable.

To implement this fix, I edited `/etc/powerdns/pdns.conf`, and found the two options commented out and waiting. In my case I used the local piHole server for the resolve target. 

Next, I restarted the service by running `systemctl restart pdns`, and was able to add the record in the web UI.

`vsnine.org. ALIAS vsnine.org.cdn.cloudflare.net.` 

And then ran some tests. I was happy to see positive results. (Don't forget the trailing dot!)

![PowerDNS Admin utility showing ALIAS and CNAME records](pdns1/pdns1a.png)

## The results
So here is the internal response for www.vsnine.org via `dig`, which shows the CNAME:
```
;; QUESTION SECTION:
;www.vsnine.org.                        IN      A

;; ANSWER SECTION:
www.vsnine.org.         3600    IN      CNAME   www.vsnine.org.cdn.cloudflare.net.
```

And now the internal response for vsnine.org, which is an ALIAS type. You can see that pdns automatically solved the answer for the CNAME and instead returns the data as an A record.
```
;; QUESTION SECTION:
;vsnine.org.                    IN      A

;; ANSWER SECTION:
vsnine.org.             300     IN      A       172.67.171.164
vsnine.org.             300     IN      A       104.21.55.155
```

## Epilogue

What if you're not using PowerDNS? What options are out there? 

So far my searches haven't been especially fruitful. But for systems like BIND, using nsupdate is an option if you're willing to wrap a little bit of scripting around it. This example from [Reddit /r/usefulscripts](https://www.reddit.com/r/usefulscripts/comments/6saiq0/request_dynamically_update_a_record_in_bind_dns/dlbo0ci?utm_source=share&utm_medium=web2x&context=3) by lbiegaj seems like it would be a decent starting point, with some logic and a cronjob added on.

```
echo "server 127.0.0.1
zone mydomain.eu.
update delete $HOSTNAME.mydomain.eu. A
update add $HOSTNAME.mydomain.eu. 3600 A $IP
send" | nsupdate -d -k $KEYFILE
```
