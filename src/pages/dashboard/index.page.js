import { Button } from 'components/Button';
import { Heading } from 'components/Heading';
import { Input } from 'components/Input';
import { Meta } from 'components/Meta';
import { Section } from 'components/Section';
import { Text } from 'components/Text';
import fs from 'fs';
import { useRouter } from 'next/router';
import path from 'path';
import { useState } from 'react';
import { parseCookies, verifyToken } from 'utils/auth';
import styles from './dashboard.module.css';

export default function Dashboard({ user, initialProjects }) {
  const router = useRouter();
  const [projectsData, setProjectsData] = useState(initialProjects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  
  const defaultForm = {
    id: '',
    title: '',
    description: '',
    buttonText: 'View Project',
    buttonLink: '',
    category: 'web',
    type: 'laptop',
    alt: 'Project screenshot',
    textures: [{ src: '', placeholder: '' }],
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const refreshData = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjectsData(data);
  };

  const handleEdit = (project, category) => {
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description,
      buttonText: project.buttonText,
      buttonLink: project.buttonLink,
      category,
      type: project.model?.type || 'laptop',
      alt: project.model?.alt || '',
      textures: project.model?.textures || [{ src: '', placeholder: '' }],
    });
    setEditingCategory(category);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id, category) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, category }),
    });
    
    refreshData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      project: {
        id: formData.id,
        title: formData.title,
        description: formData.description,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        model: {
          type: formData.type,
          alt: formData.alt,
          textures: formData.textures,
        },
      },
    };

    if (isEditing) {
      payload.oldCategory = editingCategory;
      payload.newCategory = formData.category;
      
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      payload.category = formData.category;
      
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setIsFormOpen(false);
    setIsEditing(false);
    refreshData();
  };

  const handleTextureChange = (index, field, value) => {
    const newTextures = [...formData.textures];
    newTextures[index][field] = value;
    setFormData({ ...formData, textures: newTextures });
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingIndex(index);

    try {
      // 1. Convert to WebP on Client Side
      const webpBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/webp', 0.8));
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });

      // 2. Upload to Server
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: webpBase64 }),
      });

      const data = await res.json();
      if (res.ok) {
        const newTextures = [...formData.textures];
        newTextures[index] = {
          src: data.url,
          placeholder: data.url,
        };
        setFormData({ ...formData, textures: newTextures });
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error converting or uploading image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const addTexture = () => {
    setFormData({ ...formData, textures: [...formData.textures, { src: '', placeholder: '' }] });
  };

  const removeTexture = (index) => {
    const newTextures = [...formData.textures];
    newTextures.splice(index, 1);
    setFormData({ ...formData, textures: newTextures });
  };

  return (
    <Section className={styles.dashboard}>
      <Meta title="Dashboard" description="Admin Dashboard" />
      
      <div className={styles.header}>
        <div>
          <Heading level={2} as="h1">Dashboard</Heading>
          <Text style={{ marginTop: 'var(--spaceS)' }}>Welcome, {user.username}</Text>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spaceM)' }}>
          {!isFormOpen && (
            <Button onClick={() => {
              setFormData(defaultForm);
              setIsEditing(false);
              setIsFormOpen(true);
            }}>
              Add New Project
            </Button>
          )}
          <Button secondary onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      {!isFormOpen ? (
        <div className={styles.list}>
          <Heading level={3} as="h2">Web Projects</Heading>
          {projectsData.web?.map((project) => (
            <div key={project.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <div className={styles.cardActions}>
                <Button secondary onClick={() => handleEdit(project, 'web')}>Edit</Button>
                <Button secondary onClick={() => handleDelete(project.id, 'web')}>Delete</Button>
              </div>
            </div>
          ))}

          <Heading level={3} as="h2" style={{ marginTop: 'var(--spaceL)' }}>Mobile Projects</Heading>
          {projectsData.mobile?.map((project) => (
            <div key={project.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <div className={styles.cardActions}>
                <Button secondary onClick={() => handleEdit(project, 'mobile')}>Edit</Button>
                <Button secondary onClick={() => handleDelete(project.id, 'mobile')}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.formContainer}>
          <Heading level={3}>{isEditing ? 'Edit Project' : 'Add New Project'}</Heading>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <Input
                label="Project Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div className={styles.formRow}>
              <Input
                label="Button Text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                required
              />
              <Input
                label="Button Link URL"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                required
              />
            </div>
            
            <div className={styles.formRow}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'inherit', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                >
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Device Model Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'inherit', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
                >
                  <option value="laptop">Laptop</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>

            <div className={styles.texturesSection}>
              <Heading level={4}>Images (Textures)</Heading>
              <Text style={{ fontSize: '12px', marginTop: '8px' }}>
                Upload an image. It will be automatically converted to WebP. Alternatively, type an existing variable name.
              </Text>
              
              {formData.textures.map((texture, index) => (
                <div key={index} className={styles.textureItem} style={{ flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Image {index + 1}</strong>
                    {formData.textures.length > 1 && (
                      <Button type="button" secondary onClick={() => removeTexture(index)}>Remove</Button>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(index, e)}
                    style={{ marginBottom: '8px' }}
                    disabled={uploadingIndex === index}
                  />
                  {uploadingIndex === index && <Text>Converting & Uploading...</Text>}

                  <div style={{ display: 'flex', gap: 'var(--spaceM)' }}>
                    <Input
                      label="Image Source (URL or Variable)"
                      value={texture.src}
                      onChange={(e) => handleTextureChange(index, 'src', e.target.value)}
                      required
                    />
                    <Input
                      label="Placeholder (URL or Variable)"
                      value={texture.placeholder}
                      onChange={(e) => handleTextureChange(index, 'placeholder', e.target.value)}
                      required
                    />
                  </div>
                  
                  {texture.src && texture.src.startsWith('/') && (
                    <img src={texture.src} alt="Preview" style={{ maxWidth: '200px', borderRadius: '4px', marginTop: '8px' }} />
                  )}
                </div>
              ))}
              
              <Button type="button" secondary onClick={addTexture} style={{ marginTop: 'var(--spaceM)' }}>
                Add Another Image
              </Button>
            </div>

            <div className={styles.formActions}>
              <Button type="submit">Save Project</Button>
              <Button type="button" secondary onClick={() => setIsFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </Section>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.auth_token;

  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const user = verifyToken(token);
  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  // Load initial data securely from server side
  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  const initialProjects = JSON.parse(fileData);

  return {
    props: {
      user,
      initialProjects,
    },
  };
}
