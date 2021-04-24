---
title: PowerDNS for internal use, Cloudflare for external use.
description: Making my home lab run a little more smoothly.
date: 2021-04-24T12:00:00.000Z
---

## The problem

After recently setting up this blog at Cloudflare Pages, I was having trouble reaching it hostname vsnine.org, as I had initially setup that zone as a split horizon. The external zone had grown up and moved to Cloudflare a few years ago, which was fine as the domain was mostly handling email.

How to fix it? For a while I've understood that you can't place a CNAME record as the target of a DNS zone's origin or apex record. I could have tried to manually add the same Cloudflare IPs to my private DNS, but there is the chance the IPs could change sometime down the road.

This ISC blog goes into more details and was quite useful: [ISC Blog: CNAME at the apex of a zone](https://www.isc.org/blogs/cname-at-the-apex-of-a-zone/) It lists a number of potential options and weighs the pros and cons. It describes how RFC1034 states that a CNAME record cannot be shared by any other types, so while a CNAME apex could technically work, it likely won't work well, or have undesired results. 

In my case, I'll be using alternative #4: the ALIAS record type.

## So what next?
Through my work with Cloudflare over the past couple of years, I had learned that they provide CNAME records for all hostnames, and they are automatically updated by the Cloudflare network. By appending the actual name with `.cdn.cloudflare.net`, their edge will route the traffic where it needs to go, as long as the host header matches what's set in DNS. This allows for some flexibility in mixing externally hosted sites alongside internal ones, or for mixing in other styles of DNS hosting. It may not always be desirable to host the entire zone at Cloudflare, depending on your requirements.

My internal DNS service is provided by a PowerDNS server, which I found does support use of the ALIAS record type pointed to a CNAME. More info on this is available in the docs here: [PowerDNS: Using ALIAS records](https://doc.powerdns.com/authoritative/guides/alias.html)

Some other products and providers support CNAME flattening as well, but it is not guaranteed.

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

What if you're not using PowerDNS? What options are out there? So far my searches haven't been especially fruitful. But for systems like BIND, using nsupdate is an option if you're willing to wrap a little bit of scripting around it. [Reddit /r/usefulscripts Post](https://www.reddit.com/r/usefulscripts/comments/6saiq0/request_dynamically_update_a_record_in_bind_dns/dlbo0ci?utm_source=share&utm_medium=web2x&context=3)
