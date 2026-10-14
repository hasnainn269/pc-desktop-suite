export const CONVERSIONS: Record<string, { factor: number; outputUnit: string }> = {
  "KB to MB": { factor: 1 / 1024, outputUnit: "MB" },
  "MB to GB": { factor: 1 / 1024, outputUnit: "GB" },
  "GB to MB": { factor: 1024, outputUnit: "MB" },
  "MB to KB": { factor: 1024, outputUnit: "KB" },
  "Bytes to KB": { factor: 1 / 1024, outputUnit: "KB" },
  "KB to Bytes": { factor: 1024, outputUnit: "Bytes" },
};

export function convertValue(value: number, unitKey: string): string {
  const conv = CONVERSIONS[unitKey];
  if (!conv) return "Unsupported conversion";
  const inputUnit = unitKey.split(" to ")[0];
  const outputVal = value * conv.factor;
  const formattedOut = Number(outputVal.toFixed(6)).toString();
  return `${value} ${inputUnit} = ${formattedOut} ${conv.outputUnit}`;
}
