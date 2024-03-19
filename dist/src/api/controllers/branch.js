import * as BranchService from '../services/branch.js';
export async function getBranches(req, res) {
    const branches = await BranchService.getBranches();
    res.json(branches);
}
export async function getBranch(req, res) {
    const id = req.params['id'] || '';
    if (!id) {
        res.status(400).json('Miss id');
        return;
    }
    const branch = await BranchService.getBranch(id);
    res.json(branch);
}
export async function search(req, res) {
    const text = req.params['text'] || '';
    if (!text) {
        res.status(400).json('Miss search text');
        return;
    }
    const branches = await BranchService.search(text);
    res.json(branches);
}
