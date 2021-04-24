import React, { useState } from "react";
import { Stack, Nav } from "@fluentui/react";

import CookieDetails from "./components/cookie-details";
import cookieMonster from "./cookie-monster.png";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("Cookies");

  const main = ((screen) => {
    switch (screen) {
      case "Workflows":
        return (
          <img src={cookieMonster} alt="foo" style={{ maxWidth: "100%" }} />
        );
      case "Cookies":
      default:
        return <CookieDetails />;
    }
  })(screen);

  return (
    <div className="App">
      <Stack horizontal>
        <Stack.Item>
          <Nav
            onLinkClick={(event, item) => item && setScreen(item.name)}
            groups={[
              {
                links: [
                  {
                    name: "Cookies",
                    url: "",
                  },
                  {
                    name: "Workflows",
                    url: "",
                  },
                ],
              },
            ]}
          />
        </Stack.Item>
        <Stack.Item grow>
          <main>{main}</main>
        </Stack.Item>
      </Stack>
    </div>
  );
}

export default App;
