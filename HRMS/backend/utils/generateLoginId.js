// utils/generateLoginId.js
// Format: [CompanyPrefix][First2LettersFirstName][First2LettersLastName][JoiningYear][SerialNumber]
// Example: OIJODO20220001 -> OI + JO + DO + 2022 + 0001

function generateLoginId(companyPrefix, firstName, lastName, joiningYear, serialNumber) {
  const firstPart = firstName.substring(0, 2).toUpperCase();
  const lastPart = lastName.substring(0, 2).toUpperCase();
  const paddedSerial = String(serialNumber).padStart(4, '0');
  return `${companyPrefix}${firstPart}${lastPart}${joiningYear}${paddedSerial}`;
}

module.exports = generateLoginId;

