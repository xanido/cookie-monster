import React, { useEffect, useState, useRef } from "react";
import { merge } from "lodash";
import {
  PrimaryButton,
  DetailsListLayoutMode,
  SelectionMode,
  IDetailsRowProps,
  DetailsRow,
  DetailsList,
} from "@fluentui/react";
import { DeleteIcon } from "@fluentui/react-icons-mdl2";

import logo from "./logo.svg";
import cookieMonster from "./cookie-monster.png";
import "./App.css";

type KeyOfObject<O> = keyof O;
type KnownCookie = KeyOfObject<typeof COOKIES>;

const COOKIES = {
  foo: "bar",
  bar: "foo",
  secret_auth_token: "topsecret",
} as const;

function App() {
  const [cookies, setCookies] = useState<chrome.cookies.Cookie[]>([]);
  const [activeUrl, setActiveUrl] = useState<URL>();
  const activeDomain = activeUrl?.host;
  const queue = useRef(Promise.resolve());

  // read the current active tab url
  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url as string);
        setActiveUrl(url);
      });
  }, []);

  // util to reload cookies for the active domain
  const readCookiesIntoState = () => {
    if (!activeDomain) return;
    chrome.cookies.getAll(
      {
        domain: activeDomain,
      },
      (cookies_) => {
        queue.current.then(() => setCookies(cookies_));
      }
    );
  };

  // immediately try to read the cookies
  useEffect(readCookiesIntoState, [activeDomain]);

  // handler factory - deletes a specific chrome.cookies.Cookie
  // and then re-syncs the cookie state
  const handleDeleteCookie = (cookie: any) => () => {
    chrome.cookies.remove(
      {
        name: cookie.name,
        url: `https://${cookie.domain}${cookie.path}`,
      },
      readCookiesIntoState
    );
  };

  //handler factory - inject a known cookie from the COOKIES dict
  const injectCookie = (cookieKey: KnownCookie) => () => {
    chrome.cookies.set(
      {
        url: String(activeUrl),
        name: cookieKey,
        value: COOKIES[cookieKey],
      },
      readCookiesIntoState
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>

      <main>
        <PrimaryButton
          menuProps={{
            shouldFocusOnMount: true,
            items: (Object.keys(COOKIES) as KnownCookie[]).map((name) => ({
              key: name,
              name: name,
              onClick: injectCookie(name),
            })),
          }}
        >
          Inject cookie
        </PrimaryButton>

        <DetailsList
          layoutMode={DetailsListLayoutMode.justified}
          compact
          items={cookies.map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
            cookie,
          }))}
          columns={[
            {
              key: "name",
              name: "name",
              isMultiline: false,
              minWidth: 100,
              maxWidth: 200,
              fieldName: "name",
            },
            {
              key: "value",
              name: "value",
              isMultiline: true,
              minWidth: 250,
              fieldName: "value",
            },
            {
              key: "actions",
              name: "",
              onRender: (item, index, column) => {
                console.log(item);
                return <DeleteIcon onClick={handleDeleteCookie(item.cookie)} />;
              },
              minWidth: 24,
              maxWidth: 24,
            },
          ]}
          selectionMode={SelectionMode.single}
          onRenderRow={(props?: IDetailsRowProps): JSX.Element => {
            if (!props) {
              return <DetailsRow item={undefined} itemIndex={-1} />;
            }
            const customStyles = merge(props.styles, {
              root: {
                userSelect: "any",
              },
            });
            return <DetailsRow {...props} styles={customStyles} />;
          }}
        />
      </main>

      <footer>
        <img src={cookieMonster} alt="Cookie Monsterrr" />
      </footer>
    </div>
  );
}

export default App;
