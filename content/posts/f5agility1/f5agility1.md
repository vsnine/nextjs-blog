---
title: F5 Agility 2021 Highlights - Part 1
description: New and interesting stuff from this year's conference.
date: 2021-04-22T12:00:00.000Z
---

## Some thoughts

Thought I'd write down a few notes of the highlights of attending F5's conference, Agility, which is now in its second virtual year due to COVID-19.

I attended in person a few years ago when it was in Chicago, which was a cool experience to meet a bunch of F5ers in person. This time the interactions are a little more limited to the session chat rooms, lab working sessions, and the daily hangouts with the DevCentral team of Jason, John, and Peter.

This time around they have a ton to bring to the table with their acquisitions of NGINX, Shape, and Volterra. There has been a mix of live streams, pre-recorded demos, and lab sessions.

## Wanna go FASTer?
My highlight of the con so far has been getting my hands on a live lab demo of the [vscode-f5](https://f5devcentral.github.io/vscode-f5) plugin, which will help administrators who want to deploy their F5 configuration as code! 

It is hosted on the f5devcentral github and is a free extension to Visual Studio Code. It will work in the remote versions of VSCode over SSH, as well as in the web-based ```code-server``` deployment.

I had looked at an early version last year, but couldn't use it at the time. Coming back to it after the team at F5 has put in a ton of work was a nice surprise. Today, the module has support for managing F5's various extension plugins, which include:

* Application Services 3 (AS3) - deploy your apps
* Declarative Onboarding (DO) - configure your box
* Telemetry Streaming (TS) - see what your box and apps are doing

And, new to me: FAST, or F5 Application Services Templates. This is a templating engine that lives on the BIG-IP, and seems much like the predecessor iApps (at least in spirit). It uses simplified templates which turn into AS3 declarations, which in turn will do the heavy lifting on the BIG-IP side.

Other addons are a config explorer which can use your UCS or QKView archives to provide easy insight into the config, either over time or based on current data.

This leads to the next item...

## Speaking a new language

A big surprise while working through the lab was being introduced to AS3 Config Converter (ACC) ([github](https://github.com/f5devcentral/f5-as3-config-converter)), announced just a few days ago. 

In a nutshell, it takes existing BIG-IP (tmsh) configuration, and transforms it into AS3 declarations. Being able to convert the "brownfield" to updated "greenfield" configurations is definitely attractive, and removes much of the concern that I personally felt when trying to craft AS3 declarations by hand.

## Do I know you?

Learning more about Device ID+ was interesting, and it is available for free through the F5 Cloud Services site. It generates a unique identifier for clients that visit a site, which can be leveraged to help make decisions on whether a client is safe, or potentially malicious.

Device ID+ installs into a webapp by including a Javascript file and gathers data about the clients that connect. The dashboard shows general stats about new vs returning users, device age, session length, country, as well as details on the number of devices per ASN and user agents per device. 

The identifier is passed to the backend server via a cookie, so it could be leveraged to make decisions or be recorded in the SIEM. An [earlier example](https://www.youtube.com/watch?v=ULXv4umSugA) by Matthieu Dierick explains how F5 APM (with an additional DB service) could use it to decide whether to step-up authentication should the values change.

Overall it seems like a decent first step on a path towards implementing a greater anti-bot solution and was very easy to get running in my lab.