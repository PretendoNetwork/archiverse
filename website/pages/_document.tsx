import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#3caa00" />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4203889559099732"
            crossOrigin="anonymous"
          ></script>
          <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
          <meta name="google-adsense-account" content="ca-pub-4203889559099732" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;