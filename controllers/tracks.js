const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Track = require('../models/track.js');
const router = express.Router();

// POST - Create
router.post('/', async (req, res) => {
    try {
        const { title, artist } = req.body;
        if (!title || !artist) {
            return res.status(400).json({ error: 'Title and artist are required' });
        }

        const track = await Track.create({ title, artist });
        res.status(201).json({
            message: 'Track created successfully',
            track
        });
    }catch (error){
        console.error('Error creating track:', error);
        res.status(500).json({ error: 'An error occurred while creating the track' });
    }
});

// GET - Index
router.get('/', async (req, res) => {
    try {
        const itemsFound = await Item.find().populate('owner');
        if (!itemsFound.length) {
            res.status(404);
            throw new Error('No items found');
        }
        res.status(200).json(itemsFound);
    } catch (error) {
        if (res.statusCode === 404) {
            res.json({ error: error.message })
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// GET - Show one item by itemId
router.get('/:itemId', async (req, res) => {  
    try {
        const foundItem = await Item.findById(req.params.itemId).populate('owner');
        if (!foundItem) {
            res.status(404);
            throw new Error('Item not found.');
          }
        res.status(200).json(foundItem);
    }catch(error){
        if (res.statusCode === 404) {
            res.json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
          }
    }

});

// PUT - Update Item
router.put('/:itemId', async (req, res) => {
    try {
        // Find the original item before update
        const item = await Item.findById(req.params.itemId).populate('owner');
        if (!item) {
            return res.status(404).send("Item not found.");
        }
        if (!item.owner._id.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        // Track changes between original item and new values in req.body
        const changes = [];
        for (const key in req.body) {
            if (item[key] !== undefined && item[key] !== req.body[key] && key !== 'owner' && key !== '_id') {
                changes.push(`${key} from "${item[key]}" to "${req.body[key]}"`);
            }
        }

        // Update the item with the new values
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.itemId,
            req.body,
            { new: true, runValidators: true }
        );
        updatedItem._doc.owner = req.user;

        // Create a detailed activity log if there are changes
        if (changes.length > 0) {
            const changeDescription = changes.join(', ');
            await Activity.create({
                user: req.user._id,
                item: updatedItem._id,
                action: 'UPDATE',
                timestamp: new Date(),
                details: `User ${req.user.username} updated item "${updatedItem.name}": ${changeDescription}`,
            });
        } else {
            await Activity.create({
                user: req.user._id,
                item: updatedItem._id,
                action: 'UPDATE',
                timestamp: new Date(),
                details: `User ${req.user.username} made no changes to item "${updatedItem.name}"`,
            });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// DELETE - Remove
router.delete('/:itemId', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete({ _id: req.params.itemId }).populate('owner');
        if (!deletedItem) {
            res.status(404)
            throw new Error('Item not found.')
        }
        await Activity.create({
            user: req.user._id,
            item: deletedItem._id,
            action: 'DELETE',
            timestamp: new Date(),
            details: `User ${req.user.username} deleted item "${deletedItem.name}"`,
        });
        res.status(200).json(deletedItem)
    } catch (error) {
        if (res.statusCode === 404) {
            res.json({ error: error.message })
        } else {
            res.status(500).json({ error: error.message })
        }
    }
})


module.exports = router