const { Inventory } = require('../models/inventoryModel');

const getAllInventory = async (req, res) => {
    try {
        const items = await Inventory.getAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching inventory' });
    }
};

const createInventoryItem = async (req, res) => {
    try {
        const id = await Inventory.create(req.body);
        res.status(201).json({ message: 'Item created', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating item' });
    }
};

const updateInventoryItem = async (req, res) => {
    try {
        const updated = await Inventory.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating item' });
    }
};

const deleteInventoryItem = async (req, res) => {
    try {
        const deleted = await Inventory.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting item' });
    }
};

module.exports = { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem };
