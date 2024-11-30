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
        const tracks = await Track.find();
        if (!tracks.length) {
            return res.status(404).json({ error: 'No tracks found' });
        }
        res.status(200).json(tracks);
    } catch (error) {
        console.error('Error retrieving tracks:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the tracks' });
    }
});

// GET - Retrieve a single track by ID
router.get('/:id', async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.status(200).json(track);
    } catch (error) {
        console.error('Error retrieving track:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the track' });
    }
});

// PUT - Update an existing track
router.put('/:id', async (req, res) => {
    try {
        const updatedTrack = await Track.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTrack) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.status(200).json(updatedTrack);
    } catch (error) {
        console.error('Error updating track:', error);
        res.status(500).json({ error: 'An error occurred while updating the track' });
    }
});

// DELETE - Remove a track by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedTrack = await Track.findByIdAndDelete(req.params.id);

        if (!deletedTrack) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.status(200).json(deletedTrack);
    } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ error: 'An error occurred while deleting the track' });
    }
});




module.exports = router