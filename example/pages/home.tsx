import React, { FC, useEffect } from "react";
import { css } from "emotion";
import { JimoButton } from "@jimengio/jimo-basics";
import { genSeedApiTree } from "../../src";
import { DocDemo, DocSnippet, DocBlock } from "@jimengio/doc-frame";
import { Space } from "@jimengio/flex-styles";

let PageHome: FC<{}> = React.memo((props) => {
  /** Plugins */

  /** Methods */

  /** Effects */

  /** Renderers */
  return (
    <div>
      <DocBlock content={intro} />
      <DocDemo title="Sign up">
        <div>
          <JimoButton
            text={"Signin"}
            onClick={() => {
              alert("TODO");
            }}
          />
          <Space width={8} />
        </div>

        <DocBlock content={content} />
      </DocDemo>
    </div>
  );
});

export default PageHome;

let styleCode = css`
  max-height: 300px;
  overflow: auto;
`;

let content = `

TODO

`;

let intro = `
平台 API 文档.
`;
