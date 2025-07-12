function navigatingTo(args) {
  console.log("Page is loading...");
  const page = args.object;
  console.log("Page loaded successfully!");
}

exports.navigatingTo = navigatingTo;