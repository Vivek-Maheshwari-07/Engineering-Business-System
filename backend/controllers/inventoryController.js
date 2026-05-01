const inventoryModel = require('../models/inventoryModel');

const inventoryController = {
    // Add raw stock parameters 
    addStock: async (req, res) => {
        try {
            const { variant_id, quantity } = req.body;

            if (!variant_id || quantity === undefined) {
                return res.status(400).json({ message: "Variant ID and numerical Quantity fundamentally required" });
            }

            if (quantity <= 0) {
                return res.status(400).json({ message: "Mathematical bounds strictly dictate quantity > 0" });
            }

            await inventoryModel.updateStock(variant_id, quantity, 'IN', 'MANUAL', null);
            res.status(200).json({ message: "Stock structural mapping actively enriched", change_type: 'IN' });

        } catch (error) {
            res.status(500).json({ message: "Server encountered explicit structural error", error: error.message });
        }
    },

    // Removed `reduceStock` logically per architectural rules: 
    // All deduction actions run organically integrated behind the Order Controller engine bounds!

    // View overall active inventory parameters across all matrix nodes
    getAll: async (req, res) => {
        try {
            const inventory = await inventoryModel.getAllInventory();
            res.status(200).json(inventory);
        } catch (error) {
            res.status(500).json({ message: "Fetching active logs structurally failed", error: error.message });
        }
    },

    // Historical tracking auditing logic natively mapping actions over bounds
    getLogs: async (req, res) => {
        try {
            const logs = await inventoryModel.getInventoryLogs();
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ message: "Failed extracting native historical logs structurally", error: error.message });
        }
    }
};

module.exports = inventoryController;
