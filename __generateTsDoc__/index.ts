import * as path from "path";
import fs from "fs";
import glob from "glob";
import { TSDocParser, TSDocConfiguration, DocExcerpt } from "@microsoft/tsdoc";
import { TSDocConfigFile } from "@microsoft/tsdoc-config";
// @ts-ignore
import { Formatter } from "./fomatter";
// @ts-ignore
import htmlTemplate from "./htmlTemplate";
import DeepMerge from "deepmerge";
import { isPlainObject } from "is-plain-object";
import { Buffer } from "buffer";

const getConfigSettings = () => {
  // Sample source file to be parsed
  const mySourceFile: string = path.resolve("./src/index.ts");

  // Load the nearest config file, for example `my-project/tsdoc.json`
  const tsdocConfigFile: TSDocConfigFile = TSDocConfigFile.loadForFolder(
    path.dirname(mySourceFile)
  );
  if (tsdocConfigFile.hasErrors) {
    // Report any errors
    console.log(tsdocConfigFile.getErrorSummary());
  }

  // Use the TSDocConfigFile to configure the parser
  const tsdocConfiguration: TSDocConfiguration = new TSDocConfiguration();
  tsdocConfigFile.configureParser(tsdocConfiguration);
  const tsdocParser: TSDocParser = new TSDocParser(tsdocConfiguration);
  return tsdocParser;
};

const deepMergeObj = (obj1: object, obj2: object): Record<string, string> => {
  return DeepMerge(obj1, obj2, {
    isMergeableObject: isPlainObject,
  }) as Record<string, string>;
};

const stringify = (json: any) => {
  return JSON.stringify(json).replace(/\\n/g, "").replace(/"/g, "");
};

const diggerDirectory = (pathName: string) => {
  const ex = path.extname(pathName);
  const fileDir = pathName.split("/").filter((val) => {
    if (val !== "" && !val.includes(ex)) return val;
  });
  let outPutDir = "/";
  for (const innerDir of fileDir) {
    outPutDir = path.join(outPutDir, innerDir);
    if (!fs.existsSync(outPutDir)) {
      fs.mkdirSync(outPutDir);
    }
  }
};

const replaceTags = (text: string) => {
  if (text.includes("@link")) {
    // @ts-ignore
    const matchText = text.match(/\{@link(.+)\}/)[1];
    const linkText = matchText.split("|");
    const replaceText = `<a href="${linkText[0].trim()}" target="_blank">${linkText[1].trim()}</a>`;
    // @ts-ignore
    text = text.replace(`{${text.match(/\{(.+)\}/)[1]}}`, replaceText);
  }
  return text;
};

const replaceCode = (text: string) => {
  if (text.includes("`")) {
    // @ts-ignore
    const matchTexts = text.match(/\`[^\`]*\`/g) as Array<string>;
    console.log(matchTexts);
    for (let i = 0; i < matchTexts.length; i++) {
      const match = matchTexts[i];
      text = text.replace(match, `<code>${match.replace(/`/g, "")}</code>`);
    }
    return text;
  } else {
    return text;
  }
};

const replaceBr = (text: string) => {
  return text.replace(/\n/g, "<br/>");
};

const generateHTML = () => {
  const tsDoc = getConfigSettings();
  const files = glob.sync(path.resolve("./src/methods/**/*"));
  for (const file of files) {
    let property: Record<string, string | Array<string>> = {};
    const source = fs.readFileSync(file, "utf-8").toString();
    const parserContext = tsDoc.parseString(source);
    const docComment = parserContext.docComment;
    if (docComment.summarySection) {
      property = deepMergeObj(property, {
        summary: stringify(Formatter.renderDocNode(docComment.summarySection)),
      });
    }
    if (docComment.remarksBlock) {
      property = deepMergeObj(property, {
        remarks: stringify(
          Formatter.renderDocNode(docComment.remarksBlock.content)
        ),
      });
    }
    if (docComment.modifierTagSet["_nodes"].length !== 0) {
      property = deepMergeObj(property, {
        modifier: docComment.modifierTagSet.nodes
          .map((x) => `<mark>${x.tagName}</mark>`)
          .join(""),
      });
    }
    for (const paramBlock of docComment.params.blocks) {
      let params = [];
      if (property.hasOwnProperty("params")) {
        // @ts-ignore
        params = property.params.concat([
          {
            key: paramBlock.parameterName,
            text: stringify(Formatter.renderDocNode(paramBlock.content)),
          },
        ]);
      } else {
        params = [
          {
            key: paramBlock.parameterName,
            text: stringify(Formatter.renderDocNode(paramBlock.content)),
          },
        ];
      }
      property = deepMergeObj(property, {
        params: params,
      });
    }
    if (docComment.returnsBlock) {
      property = deepMergeObj(property, {
        returnsBlock: stringify(
          Formatter.renderDocNode(docComment.returnsBlock.content)
        ),
      });
    }
    property = JSON.parse(JSON.stringify(property));
    let markups: Array<string> = [];
    Object.keys(property).map((val, i) => {
      switch (val) {
        case "params":
          markups.push(`<h2>${val}</h2>`);
          let tbody = [];
          for (const para of property.params) {
            tbody.push(
              // @ts-ignore
              `<tr><td>${para.key}</td><td>${para.text}</td></tr>`
            );
          }
          markups.push(`<table>${tbody.join("\n")}</table>`);
          break;
        default:
          markups.push(`<h2>${val}</h2>`);
          markups.push(
            `<p>${replaceBr(
              replaceCode(replaceTags(property[val] as string))
            )}</p>`
          );
          break;
      }
    });
    const html = Buffer.from(
      htmlTemplate(path.basename(file), markups.join("\n"))
    ).toString("utf-8");
    const outputPath = path.resolve(
      `./docs/${path.basename(file).replace(path.extname(file), "")}.html`
    );
    diggerDirectory(outputPath);
    fs.writeFileSync(outputPath, html);
  }
  let indexHTML = "";
  for (const file of files) {
    indexHTML =
      indexHTML +
      [
        `<li><p><a href="/${path
          .basename(file)
          .replace(path.extname(file), "")}.html">${path
          .basename(file)
          .replace(path.extname(file), "")}</a></p></li>`,
      ].join("\n");
  }
  indexHTML = `<h1>Methods</h1><ul>${indexHTML}</ul>`;
  fs.writeFileSync(
    path.resolve("./docs/index.html"),
    htmlTemplate("TOP", indexHTML)
  );
};

generateHTML();
