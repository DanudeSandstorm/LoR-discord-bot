export default (input) => (
    input.trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/\s/g, '')
);
