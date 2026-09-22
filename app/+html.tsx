// app/+html.tsx
import { ScrollViewStyleReset } from "expo-router/html";
import React from "react";

export default function RootHtml({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cover to Cover</title>
        <meta
          name="description"
          content="Judge freely. Swipe through book covers and match with your next read. Cover to Cover is book discovery for people who pick by the art."
        />
        <ScrollViewStyleReset />

        {/* Buy Me a Coffee widget */}
        <script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="alexpatten"
          data-description="Support me on Buy me a coffee!"
          data-message=""
          data-color="#5F7FFF"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
        ></script>
      </head>

      <body>{children}</body>
    </html>
  );
}
