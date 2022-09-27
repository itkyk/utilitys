const htmlTemplate = (title: string, contents: string) => {
  return [
    `<!doctype html>`,
    `<html>`,
    `<meta charset="UTF-8">`,
    `<title>${title}</title>`,
    // `<link rel="stylesheet" href="/assets/css/reset.css" />`,
    `<link rel="stylesheet" href="/assets/css/theme.css" />`,
    `<link rel="stylesheet" href="/assets/css/custom.css" />`,
    `<head>`,
    `</head>`,
    `<body>`,
    `${contents}`,
    `</body>`,
    `</html>`,
  ].join("\n");
};

export default htmlTemplate;
