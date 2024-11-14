const fs = require("fs");

const file = "list/public_suffix_list.dat";

fs.readFile(file, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }

    const startsWithComments = ["// VERSION:", "// COMMIT:"];

    const jsonOutput = {
        VERSION: "",
        COMMIT: "",
        ICANN: {},
        PRIVATE: {}
    };

    let currentSection = null;
    const icannDomains = [];
    const privateDomains = [];

    data.split("\n")
        .filter((line) => line.trim().length > 0)
        .forEach((line) => {
        line = line.trim();

        // Extract version and commit information
        if (startsWithComments.some((comment) => line.startsWith(comment))) {
            if (line.startsWith("// VERSION:")) {
                jsonOutput.VERSION = line.replace("// VERSION:", "").trim();
            } else if (line.startsWith("// COMMIT:")) {
                jsonOutput.COMMIT = line.replace("// COMMIT:", "").trim();
            }
        }

        // Identify section
        if (line === "// ===BEGIN ICANN DOMAINS===") {
            currentSection = "ICANN";
        } else if (line === "// ===END ICANN DOMAINS===") {
            currentSection = null;
        } else if (line === "// ===BEGIN PRIVATE DOMAINS===") {
            currentSection = "PRIVATE";
        } else if (line === "// ===END PRIVATE DOMAINS===") {
            currentSection = null;
        } else if (currentSection && !line.startsWith("//")) {
            // Add domains to the respective section
            if (currentSection === "ICANN") {
                icannDomains.push(line);
            } else if (currentSection === "PRIVATE") {
                privateDomains.push(line);
            }
        }
    });

    // Assign domains to the JSON structure
    jsonOutput.ICANN = icannDomains;
    jsonOutput.PRIVATE = privateDomains;

    // Write JSON output to a file
    const jsonFilePath = "list/public_suffix_list.json";
    if (!fs.existsSync("list")) {
        fs.mkdirSync("list");
    }

    fs.writeFile(jsonFilePath, JSON.stringify(jsonOutput, null, 4), "utf8", (writeErr) => {
        if (writeErr) {
            console.error("Error writing JSON file:", writeErr);
        } else {
            console.log("JSON file written successfully:", jsonFilePath);
        }
    });
});
