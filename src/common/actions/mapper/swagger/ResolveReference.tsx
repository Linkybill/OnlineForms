export const resolveReference = (swaggerJson: any, reference: string): any => {
  const referenceToUse = reference.replace("#/", "");
  var referencePaths = referenceToUse.split("/");
  var objectToReturn = swaggerJson;
  referencePaths.forEach((p) => {
    if (objectToReturn !== undefined) {
      objectToReturn = objectToReturn[p];
    }
  });
  return objectToReturn;
};
