---
title: PowerDNS for internal use, Cloudflare for external use.
description: Making my home lab run a little more smoothly.
date: 2021-04-24T12:00:00.000Z
---

## Problems using Cloudflare protected sites from an internal DNS view

After recently setting up this blog at Cloudflare Pages, I was having trouble reaching it by the vsnine.org name, as I had initially set that zone up for split horizon. The external zone had grown up and moved to Cloudflare a few years ago, which was fine as the domain was mostly handling email.

How to fix it? For a while I've understood that you can't place a CNAME record as the target of a DNS zone's origin or apex record. I could have tried to manually add the same Cloudflare IPs to my private DNS, but there is the chance the IPs could change sometime down the road.

RFC1034 states that a CNAME record cannot be shared by any other types, so while a CNAME apex could technically work, you wouldn't be able to set any other types like TXT or SRV which are commonly required. This ISC blog goes into more details and was quite useful: https://www.isc.org/blogs/cname-at-the-apex-of-a-zone/ It lists a number of potential options and weighs the pros and cons.

## A solution
Through my work with Cloudflare over the past couple of years, I had learned that they provide CNAME records for all hostnames automatically. By appending the actual name with `.cdn.cloudflare.net`, their edge will route the traffic where it needs to go, as long as the host header matches what's set in DNS. This allows for some flexibility in mixing externally hosted sites alongside internal ones (or for mixing in other styles of DNS hosting)

My internal DNS service is provided by PowerDNS, which I found does support use of the ALIAS record type pointed to a CNAME. More info on this is available in the docs here: https://doc.powerdns.com/authoritative/guides/alias.html

## So what?
Simply put, PowerDNS needs the expand-alias flag set to yes, and a resolver defined. 

I edited `/etc/powerdns/pdns.conf`, and found the two options commented out and waiting. In my case I used the local piHole server for the resolve target. 

Restarted the service by running `systemctl restart pdns`, added the record

`vsnine.org. ALIAS vsnine.org.cdn.cloudflare.net.` 

and ran some tests. I was happy to see positive results. Don't forget your trailing dot!

## The results
Here is the internal response for www.vsnine.org, which is a regular CNAME:
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