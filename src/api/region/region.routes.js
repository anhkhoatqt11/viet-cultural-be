const express = require('express');
const router = express.Router();

const { createRegion, findRegionById, editRegionById, deleteRegionById } = require('./region.services');

/**
 * @swagger
 * /region/create-region:
 *   post:
 *     summary: Create a new region
 *     tags:
 *       - Region
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               regionName:
 *                 type: string
 *                 description: Name of the region
 *               regionCode:
 *                 type: string
 *                 description: Code of the region
 *               description:
 *                 type: string
 *                 description: Description of the region
 *               mediaUrl:
 *                 type: string
 *                 description: Media URL associated with the region
 *             required:
 *               - regionName
 *               - regionCode
 *     responses:
 *       201:
 *         description: Region created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created region
 *                 regionName:
 *                   type: string
 *                 regionCode:
 *                   type: string
 *                 description:
 *                   type: string
 *                 mediaUrl:
 *                   type: string
 *       500:
 *         description: Failed to create region
 */
router.post('/create-region', async (req, res, next) => {
    try {
        const { regionName, regionCode, description, mediaUrl } = req.body;
        const region = await createRegion({
            regionName,
            regionCode,
            description,
            mediaUrl,
        });
        res.status(201).json(region);
    } catch (error) {
        next(error);
    }
});


/**
 * @swagger
 * /region/get-region:
 *   get:
 *     summary: Retrieve regions
 *     tags:
 *       - Region
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID of the region to retrieve
 *     responses:
 *       200:
 *         description: A list of regions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the region
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *                   description:
 *                     type: string
 *                   mediaUrl:
 *                     type: string
 *       404:
 *         description: No regions found
 *       500:
 *         description: Failed to fetch regions
 */
router.get('/get-region', async (req, res, next) => {
    try {
        const { id } = req.query;

        const regions = await findRegionById(Number(id));
        if (!regions) {
            return res.status(404).json({ error: 'No regions found' });
        }
        res.status(200).json(regions);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /region/edit-region/{id}:
 *   put:
 *     summary: Update an existing region
 *     tags:
 *       - Region
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the region to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               regionName:
 *                 type: string
 *                 description: Updated name of the region
 *               regionCode:
 *                 type: string
 *                 description: Updated code of the region
 *               description:
 *                 type: string
 *                 description: Updated description of the region
 *               mediaUrl:
 *                 type: string
 *                 description: Updated media URL associated with the region
 *     responses:
 *       200:
 *         description: Region updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the updated region
 *                 regionName:
 *                   type: string
 *                 regionCode:
 *                   type: string
 *                 description:
 *                   type: string
 *                 mediaUrl:
 *                   type: string
 *       404:
 *         description: Region not found
 *       500:
 *         description: Failed to update region
 */
router.put('/edit-region/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { regionName, regionCode, description, mediaUrl } = req.body;
        const region = await editRegionById(id, {
            regionName,
            regionCode,
            description,
            mediaUrl,
        });
        if (!region) {
            return res.status(404).json({ error: 'Region not found' });
        }
        res.status(200).json(region);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /region/delete-region/{id}:
 *   delete:
 *     summary: Delete a region
 *     tags:
 *       - Region
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the region to delete
 *     responses:
 *       204:
 *         description: Region deleted successfully
 *       404:
 *         description: Region not found
 *       500:
 *         description: Failed to delete region
 */
// Delete a region
router.delete('/delete-region/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const region = await deleteRegionById(id);
        if (!region) {
            return res.status(404).json({ error: 'Region not found' });
        }
        res.status(204).json({ message: 'Region deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
