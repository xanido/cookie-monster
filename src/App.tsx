import React, { useState } from "react";
import { Stack } from "@fluentui/react/lib/Stack";
import { INavLink, Nav } from "@fluentui/react/lib/Nav";

import CookieDetails from "./components/cookie-details";
import imgCookieMonster from "./cookie-monster.png";
import "./App.css";
import Workflows from "./components/workflows";

enum Screen {
  Cookies = "Cookies",
  Workflows = "Workflows",
  Settings = "Settings",
}

interface ScreenLink extends INavLink {
  name: Screen;
}

const isScreenLink = (link: INavLink): link is ScreenLink =>
  link.name in Screen;
const makeScreenLink = (name: Screen): INavLink => {
  return {
    name,
    key: name,
    url: "",
  };
};

function App() {
  const [screen, setScreen] = useState(Screen.Cookies);

  const main = ((screen) => {
    switch (screen) {
      case Screen.Cookies:
        return <CookieDetails />;
      case Screen.Workflows:
        return <Workflows />;
      default:
        return (
          <img src={imgCookieMonster} alt="foo" style={{ maxWidth: "100%" }} />
        );
    }
  })(screen);

  return (
    <div className="App">
      <Stack horizontal>
        <Stack.Item>
          <Nav
            onLinkClick={(event, link) =>
              link && isScreenLink(link) && setScreen(link.name)
            }
            groups={[
              {
                links: Object.values(Screen).map(makeScreenLink),
              },
            ]}
            selectedKey={screen}
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
