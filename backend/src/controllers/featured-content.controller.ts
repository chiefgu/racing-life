import { Request, Response } from 'express';
import db from '../config/database';

// Get active featured content for homepage
export async function getFeaturedContent(req: Request, res: Response) {
  try {
    const content = await db('featured_content')
      .where('is_active', true)
      .orderBy('display_order', 'asc')
      .orderBy('published_at', 'desc')
      .select('*');

    const featuredStory = content.find((c) => c.type === 'featured_story');
    const expertAnalysis = content.find((c) => c.type === 'expert_analysis');

    res.json({
      featured_story: featuredStory || null,
      expert_analysis: expertAnalysis || null,
    });
  } catch (error) {
    console.error('Error fetching featured content:', error);
    res.status(500).json({
      error: 'Failed to fetch featured content',
      featured_story: null,
      expert_analysis: null,
    });
  }
}

// Get all featured content (admin)
export async function getAllFeaturedContent(req: Request, res: Response) {
  try {
    const { type, is_active } = req.query;

    let query = db('featured_content').orderBy('display_order', 'asc').orderBy('created_at', 'desc');

    if (type) {
      query = query.where('type', type as string);
    }

    if (is_active !== undefined) {
      query = query.where('is_active', is_active === 'true');
    }

    const content = await query.select('*');

    res.json({ content });
  } catch (error) {
    console.error('Error fetching all featured content:', error);
    res.status(500).json({ error: 'Failed to fetch featured content' });
  }
}

// Create featured content (admin)
export async function createFeaturedContent(req: Request, res: Response) {
  try {
    const {
      type,
      title,
      description,
      image_url,
      author_name,
      author_image_url,
      published_at,
      link_url,
      is_active,
      display_order,
    } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({ error: 'Type, title, and description are required' });
    }

    if (!['featured_story', 'expert_analysis'].includes(type)) {
      return res.status(400).json({ error: 'Type must be featured_story or expert_analysis' });
    }

    const [content] = await db('featured_content')
      .insert({
        type,
        title,
        description,
        image_url,
        author_name,
        author_image_url,
        published_at: published_at || new Date(),
        link_url,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0,
      })
      .returning('*');

    res.status(201).json({ content });
  } catch (error) {
    console.error('Error creating featured content:', error);
    res.status(500).json({ error: 'Failed to create featured content' });
  }
}

// Update featured content (admin)
export async function updateFeaturedContent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const [content] = await db('featured_content')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!content) {
      return res.status(404).json({ error: 'Featured content not found' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Error updating featured content:', error);
    res.status(500).json({ error: 'Failed to update featured content' });
  }
}

// Delete featured content (admin)
export async function deleteFeaturedContent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deleted = await db('featured_content').where('id', id).del();

    if (!deleted) {
      return res.status(404).json({ error: 'Featured content not found' });
    }

    res.json({ message: 'Featured content deleted successfully' });
  } catch (error) {
    console.error('Error deleting featured content:', error);
    res.status(500).json({ error: 'Failed to delete featured content' });
  }
}
