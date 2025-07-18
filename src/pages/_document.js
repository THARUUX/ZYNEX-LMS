import { Html, Head, Main, NextScript } from "next/document";
import PrelineScript from "../../components/PreLineScript";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased bg-white">
        <Main />
        <NextScript />
        <PrelineScript />
      </body>
    </Html>
  );
}
