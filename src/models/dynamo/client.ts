
export const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.

};

export const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};


// export const objectMap = (
//   obj: { [s: string]: string|number; }, 
//   fn: (arg0: string|number, arg1: string, arg2: number) => {[s: string]: string|number;}) =>
//   Object.fromEntries(
//     Object.entries(obj).map(
//       ([k, v], i) => [k, fn(v, k, i)]
//     )
//   )

// export function objectMap(object:{ [s: string]: string|number; }, mapFn) {
//   return Object.keys(object).reduce(function (result, key) {
//     result[key] = mapFn(object[key])
//     return result
//   }, {})
// }
