export default function isValidId(id) {
    if (typeof id !== 'string' || id.trim() === '') {
        return false;
    }

    const idRegex = /^[a-fA-F0-9-]+$/;
    if (!idRegex.test(id)) {
        return false;
    }

    if (id.length!== 24) {
        return false;
    }

    // All checks passed, ID is valid
    return true;
}