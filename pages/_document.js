import Document, { Head, Main, NextScript, Html } from "next/document";

import { getSiteMetaData } from "@utils/helpers";

export default class MyDocument extends Document {
  render() {
    const siteMetadata = getSiteMetaData();

    return (
      <Html lang={siteMetadata.language}>
        <Head />
        <body>
          <Main />
          <NextScript />
          <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "6a28ec38f9174cc5851bfa530473936f"}'></script>
          <script async defer src="https://us.gimp.zeronaught.com/__imp_apg__/js/f5cs-a_aa4NEjDc39-9fb27e6d.js" id="_imp_apg_dip_"  ></script>
        </body>
      </Html>
    );
  }
}
