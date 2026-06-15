import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Save, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Info,
  CheckCircle,
  HelpCircle,
  FileText,
  User,
  Film,
  Building,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function BriefEntryForm({ currentPage, setCurrentPage, selectedBriefId, setSelectedBriefId }) {
  const isEditMode = !!selectedBriefId;

  // Loading & Action State
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Client Picker State
  const [isNewClient, setIsNewClient] = useState(false);
  
  // Form Fields State
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [projectType, setProjectType] = useState('film');
  const [priority, setPriority] = useState('normal');
  
  const [scriptText, setScriptText] = useState('');
  const [scriptFile, setScriptFile] = useState([]); // Array of File objects
  
  const [referencesText, setReferencesText] = useState('');
  const [referencesFiles, setReferencesFiles] = useState([]); // Array of File objects
  
  const [brandText, setBrandText] = useState('');
  const [brandFile, setBrandFile] = useState([]); // Array of File objects
  
  const [deliveryFormat, setDeliveryFormat] = useState('mp4_1080p');
  const [customDeliverySpec, setCustomDeliverySpec] = useState('');
  
  const [approvalContacts, setApprovalContacts] = useState([
    { name: '', email: '', phone: '', role: 'Client Contact' }
  ]);
  
  const [deadline, setDeadline] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  // Validation Errors
  const [errors, setErrors] = useState({});
  const [completenessScore, setCompletenessScore] = useState(0);

  // Fetch initial data (clients, and brief details if editing)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const clientsRes = await api.clients.list();
        setClients(clientsRes.data || []);

        if (isEditMode) {
          const briefRes = await api.briefs.get(selectedBriefId);
          const brief = briefRes.data;
          
          if (brief) {
            setClientId(brief.client_id || '');
            setProjectTitle(brief.project_title || '');
            setProjectType(brief.project_type || 'film');
            setPriority(brief.priority || 'normal');
            setScriptText(brief.script_text || '');
            setReferencesText(brief.references_text || '');
            setBrandText(brief.brand_guidelines_text || '');
            setDeliveryFormat(brief.delivery_format || 'mp4_1080p');
            setDeadline(brief.deadline ? brief.deadline.split('T')[0] : '');
            setBudgetRange(brief.budget_range || '');
            setSpecialRequirements(brief.special_requirements || '');
            
            // Check custom format specifications
            if (brief.delivery_specifications) {
              try {
                const specs = JSON.parse(brief.delivery_specifications);
                if (specs.custom_specification) {
                  setCustomDeliverySpec(specs.custom_specification);
                }
              } catch (e) {
                console.error('Failed to parse delivery specs', e);
              }
            }

            // Parse approval contacts
            if (brief.approval_contacts) {
              try {
                const contacts = typeof brief.approval_contacts === 'string' 
                  ? JSON.parse(brief.approval_contacts) 
                  : brief.approval_contacts;
                if (Array.isArray(contacts) && contacts.length > 0) {
                  setApprovalContacts(contacts);
                }
              } catch (e) {
                console.error('Failed to parse contacts', e);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Failed to load initial form data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedBriefId, isEditMode]);

  // Dynamically calculate completeness score
  useEffect(() => {
    let score = 0;
    
    // 1. Script (text or file) = 20 pts
    if (scriptText.trim().length > 5 || scriptFile.length > 0) score += 20;
    
    // 2. References (text or files) = 15 pts
    if (referencesText.trim().length > 5 || referencesFiles.length > 0) score += 15;
    
    // 3. Brand Guidelines (text or file) = 15 pts
    if (brandText.trim().length > 5 || brandFile.length > 0) score += 15;
    
    // 4. Delivery Format specified = 15 pts
    if (deliveryFormat) score += 15;
    
    // 5. Approval Contacts (≥1 with name + email) = 15 pts
    const hasValidContact = approvalContacts.some(c => c.name.trim().length > 1 && c.email.trim().length > 3);
    if (hasValidContact) score += 15;
    
    // 6. Deadline set = 10 pts
    if (deadline) score += 10;
    
    // 7. Budget range selected = 5 pts
    if (budgetRange) score += 5;
    
    // 8. Special requirements noted = 5 pts
    if (specialRequirements.trim().length > 2) score += 5;
    
    setCompletenessScore(score);
  }, [
    scriptText, scriptFile, 
    referencesText, referencesFiles, 
    brandText, brandFile, 
    deliveryFormat, approvalContacts, 
    deadline, budgetRange, specialRequirements
  ]);

  // Form field changes for approval contacts
  const handleContactChange = (idx, field, value) => {
    const updated = [...approvalContacts];
    updated[idx][field] = value;
    setApprovalContacts(updated);
  };

  const addContactRow = () => {
    setApprovalContacts([...approvalContacts, { name: '', email: '', phone: '', role: 'Client Contact' }]);
  };

  const removeContactRow = (idx) => {
    if (approvalContacts.length === 1) return;
    setApprovalContacts(approvalContacts.filter((_, i) => i !== idx));
  };

  // Form validations
  const validateForm = () => {
    const newErrors = {};
    
    if (!projectTitle.trim()) {
      newErrors.projectTitle = 'Project Title is required';
    }
    
    if (isNewClient) {
      if (!newClientName.trim()) newErrors.newClientName = 'Company name is required';
      if (!newClientContact.trim()) newErrors.newClientContact = 'Contact person name is required';
      if (!newClientEmail.trim()) {
        newErrors.newClientEmail = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(newClientEmail)) {
        newErrors.newClientEmail = 'Invalid email address';
      }
    } else {
      if (!clientId) newErrors.clientId = 'Please select a client';
    }

    // Validate approval contacts
    const contactErrors = [];
    approvalContacts.forEach((contact, idx) => {
      const rowErr = {};
      if (!contact.name.trim()) rowErr.name = 'Name is required';
      if (!contact.email.trim()) {
        rowErr.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(contact.email)) {
        rowErr.email = 'Invalid email';
      }
      if (Object.keys(rowErr).length > 0) {
        contactErrors[idx] = rowErr;
      }
    });

    if (contactErrors.length > 0) {
      newErrors.approvalContacts = contactErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({ message: 'Please fix the errors in the form before submitting.', type: 'error' });
      return;
    }

    // If completeness is below 80% and status is not draft, warn them or just prompt standard confirm
    setShowConfirmSubmit(true);
  };

  const executeSubmit = async () => {
    setShowConfirmSubmit(false);
    setSubmitLoading(true);

    try {
      let finalClientId = clientId;

      // 1. Create client first if new
      if (isNewClient) {
        const clientRes = await api.clients.create({
          company_name: newClientName,
          contact_person: newClientContact,
          email: newClientEmail,
          phone: newClientPhone,
          industry: newClientIndustry,
          address: newClientAddress
        });
        finalClientId = clientRes.data.id;
      }

      // 2. Build brief submit payload
      const deliverySpecs = {
        custom_specification: customDeliverySpec || null
      };

      const briefPayload = {
        client_id: finalClientId,
        project_title: projectTitle,
        project_type: projectType,
        priority: priority,
        script_text: scriptText,
        references_text: referencesText,
        brand_guidelines_text: brandText,
        delivery_format: deliveryFormat,
        delivery_specifications: JSON.stringify(deliverySpecs),
        approval_contacts: JSON.stringify(approvalContacts.filter(c => c.name.trim() !== '')),
        deadline: deadline || null,
        budget_range: budgetRange || null,
        special_requirements: specialRequirements
      };

      // 3. Check if we need multipart uploads
      const hasFiles = scriptFile.length > 0 || referencesFiles.length > 0 || brandFile.length > 0;
      
      let res;
      if (hasFiles) {
        // Send multipart form-data
        const formData = new FormData();
        Object.entries(briefPayload).forEach(([key, val]) => {
          if (val !== null && val !== undefined) {
            formData.append(key, val);
          }
        });

        if (scriptFile[0]) formData.append('script_file', scriptFile[0]);
        if (brandFile[0]) formData.append('brand_guidelines_file', brandFile[0]);
        
        referencesFiles.forEach(file => {
          formData.append('references_files', file);
        });

        if (isEditMode) {
          res = await api.briefs.updateWithUploads(selectedBriefId, formData);
        } else {
          res = await api.briefs.createWithUploads(formData);
        }
      } else {
        // Send standard JSON
        if (isEditMode) {
          res = await api.briefs.update(selectedBriefId, briefPayload);
        } else {
          res = await api.briefs.create(briefPayload);
        }
      }

      setToast({ 
        message: isEditMode ? 'Brief updated successfully!' : 'Brief created and submitted!', 
        type: 'success' 
      });

      // Clear edit state and navigate back after delay
      setTimeout(() => {
        setSelectedBriefId(null);
        setCurrentPage('briefs');
      }, 1500);

    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Submission failed.', type: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving form details..." />;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => { setSelectedBriefId(null); setCurrentPage('briefs'); }}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1>{isEditMode ? 'Edit Pre-Production Brief' : 'New Pre-Production Brief'}</h1>
          <p>{isEditMode ? 'Modify brief fields and re-evaluate completeness score.' : 'Submit a new creative brief to kickoff production.'}</p>
        </div>
      </div>

      <div className="grid-sidebar-layout">
        {/* Main Form Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Client Selection */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} className="text-info" />
              Client Details
            </h3>

            {/* Toggle new/existing */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="client_type" 
                  checked={!isNewClient} 
                  onChange={() => setIsNewClient(false)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Existing Studio Client
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="client_type" 
                  checked={isNewClient} 
                  onChange={() => setIsNewClient(true)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Onboard New Client
              </label>
            </div>

            {!isNewClient ? (
              <div className="form-group">
                <label className="form-label">Select Client *</label>
                <select 
                  className="form-control"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{ borderColor: errors.clientId ? 'var(--danger)' : '' }}
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.contact_person})</option>
                  ))}
                </select>
                {errors.clientId && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.clientId}</p>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Paramount Brands"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    style={{ borderColor: errors.newClientName ? 'var(--danger)' : '' }}
                  />
                  {errors.newClientName && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.newClientName}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contact Person *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Full Name"
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    style={{ borderColor: errors.newClientContact ? 'var(--danger)' : '' }}
                  />
                  {errors.newClientContact && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.newClientContact}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="client@company.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    style={{ borderColor: errors.newClientEmail ? 'var(--danger)' : '' }}
                  />
                  {errors.newClientEmail && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.newClientEmail}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="+91-XXXXX-XXXXX"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Industry Sector</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Media, Advertising, SaaS"
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Address</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Company physical address"
                    rows="2"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Project Info */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Film size={18} className="text-info" />
              Project Information
            </h3>

            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Zenith TVC - Diwali Spark"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                style={{ borderColor: errors.projectTitle ? 'var(--danger)' : '' }}
              />
              {errors.projectTitle && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.projectTitle}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Project Type *</label>
                <select 
                  className="form-control"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                >
                  <option value="film">Feature Film</option>
                  <option value="web_series">Web Series</option>
                  <option value="advertisement">TVC/Advertisement</option>
                  <option value="corporate">Corporate Video</option>
                  <option value="animation">Animation</option>
                  <option value="vfx">VFX Project</option>
                  <option value="dubbing">Dubbing/Localization</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-control"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Creative Deliverables (Script, References, Guidelines) */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} className="text-info" />
              Creative Deliverables
            </h3>

            {/* Script Section */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                <span>1. Production Script</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(20 Points)</span>
              </h4>
              <textarea 
                className="form-control" 
                placeholder="Paste script copy or draft scenes here..."
                rows="4"
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              <FileUpload 
                label="Or Upload Script File (PDF, DOCX, TXT)"
                accept=".pdf,.docx,.doc,.txt"
                multiple={false}
                files={scriptFile}
                onChange={setScriptFile}
              />
            </div>

            {/* References Section */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', display: 'flex', justifyBetween: 'space-between' }}>
                <span>2. Visual References</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(15 Points)</span>
              </h4>
              <textarea 
                className="form-control" 
                placeholder="Describe color palette, cinematography references, links, moodboards..."
                rows="3"
                value={referencesText}
                onChange={(e) => setReferencesText(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              <FileUpload 
                label="Upload Reference Files (Moodboards, images, style frames, MP4)"
                accept=".jpg,.jpeg,.png,.gif,.mp4"
                multiple={true}
                files={referencesFiles}
                onChange={setReferencesFiles}
              />
            </div>

            {/* Brand Guidelines Section */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', display: 'flex', justifyBetween: 'space-between' }}>
                <span>3. Brand Guidelines</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(15 Points)</span>
              </h4>
              <textarea 
                className="form-control" 
                placeholder="Mention primary hex codes, typography rules, do's and don'ts, logo usage..."
                rows="3"
                value={brandText}
                onChange={(e) => setBrandText(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              <FileUpload 
                label="Upload Brand Guidelines File (PDF)"
                accept=".pdf"
                multiple={false}
                files={brandFile}
                onChange={setBrandFile}
              />
            </div>
          </div>

          {/* Card 4: Technical Delivery Preset */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Film size={18} className="text-info" />
              Technical Specifications & Delivery Preset
            </h3>

            <div className="form-group">
              <label className="form-label">Delivery Format Preset *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {['mp4_1080p', 'mp4_4k', 'prores', 'mov', 'custom'].map(format => (
                  <label 
                    key={format}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: deliveryFormat === format ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${deliveryFormat === format ? 'var(--primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      transition: 'var(--transition-all)',
                      textTransform: 'uppercase'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="delivery_format" 
                      value={format} 
                      checked={deliveryFormat === format}
                      onChange={(e) => setDeliveryFormat(e.target.value)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {format.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>

            {deliveryFormat === 'custom' && (
              <div className="form-group">
                <label className="form-label">Specify Custom Specifications *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. 8K REDCODE RAW, 12-bit DNxHR, Stereo 24-bit WAV"
                  value={customDeliverySpec}
                  onChange={(e) => setCustomDeliverySpec(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Card 5: Approval Contacts */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} className="text-info" />
              Approval Contacts
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Specify the client stakeholders who will review, request revisions, and sign off on this brief before production kicks off. (At least 1 required)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {approvalContacts.map((contact, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 40px', 
                    gap: '0.75rem', 
                    alignItems: 'start' 
                  }}
                >
                  {/* Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="text" 
                      placeholder="Contact Name" 
                      className="form-control"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      style={{ 
                        padding: '0.5rem',
                        fontSize: '0.8125rem',
                        borderColor: errors.approvalContacts?.[index]?.name ? 'var(--danger)' : '' 
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="form-control"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      style={{ 
                        padding: '0.5rem',
                        fontSize: '0.8125rem',
                        borderColor: errors.approvalContacts?.[index]?.email ? 'var(--danger)' : '' 
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input 
                      type="text" 
                      placeholder="Phone" 
                      className="form-control"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      style={{ padding: '0.5rem', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Role */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select 
                      className="form-control"
                      value={contact.role}
                      onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                      style={{ padding: '0.5rem', fontSize: '0.8125rem' }}
                    >
                      <option value="Client Contact">Client Contact</option>
                      <option value="Creative Director">Creative Director</option>
                      <option value="Executive Producer">Executive Producer</option>
                      <option value="Brand Manager">Brand Manager</option>
                      <option value="Technical Director">Technical Director</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <button 
                    type="button"
                    onClick={() => removeContactRow(index)}
                    disabled={approvalContacts.length === 1}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '8px', 
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: approvalContacts.length === 1 ? 0.3 : 1
                    }}
                  >
                    <Trash2 size={14} className="text-danger" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={addContactRow} 
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1.25rem' }}
            >
              <Plus size={14} /> Add Contact Stakeholder
            </button>
          </div>

          {/* Card 6: Project Specs */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} className="text-info" />
              Timeline & Budget Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Kickoff Deadline</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Budget Range</label>
                <select 
                  className="form-control"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                >
                  <option value="">-- Select Budget --</option>
                  <option value="under_1l">Under ₹1 Lakh</option>
                  <option value="1l_5l">₹1 Lakh - ₹5 Lakhs</option>
                  <option value="5l_15l">₹5 Lakhs - ₹15 Lakhs</option>
                  <option value="15l_50l">₹15 Lakhs - ₹50 Lakhs</option>
                  <option value="above_50l">Above ₹50 Lakhs</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Special Production Requirements</label>
              <textarea 
                className="form-control" 
                placeholder="Mention CGI assets, specialized lens, outdoor locations, travel logistics..."
                rows="3"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Right Side: Score Panel & Submission */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: 'calc(var(--navbar-height) + 1.5rem)', height: 'fit-content' }}>
          
          {/* Brief Completeness Panel */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Brief Completeness</h3>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: completenessScore >= 80 ? 'var(--success)' : completenessScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {completenessScore}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>/100</span>
            </div>

            <div className="progress-container" style={{ height: '10px', marginBottom: '1.25rem' }}>
              <div 
                className="progress-bar"
                style={{ 
                  width: `${completenessScore}%`,
                  backgroundColor: completenessScore >= 80 ? 'var(--success)' : 
                                   completenessScore >= 50 ? 'var(--warning)' : 'var(--danger)'
                }}
              />
            </div>

            {completenessScore >= 80 ? (
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  backgroundColor: 'var(--success-bg)', 
                  border: '1px solid var(--success-border)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#6ee7b7'
                }}
              >
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Excellent!</strong> This brief is ready to submit. The completeness score is over 80%, satisfying the production kickoff gate.
                </span>
              </div>
            ) : (
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  backgroundColor: 'var(--warning-bg)', 
                  border: '1px solid var(--warning-border)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#fcd34d'
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Draft Mode.</strong> Add script text/file, references, brand files, and stakeholder contacts to unlock the 80% kickoff gate.
                </span>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Script details</span>
                <span style={{ color: scriptText.length > 5 || scriptFile.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {scriptText.length > 5 || scriptFile.length > 0 ? '✓ 20 pts' : '0 pts'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reference board</span>
                <span style={{ color: referencesText.length > 5 || referencesFiles.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {referencesText.length > 5 || referencesFiles.length > 0 ? '✓ 15 pts' : '0 pts'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Brand identity</span>
                <span style={{ color: brandText.length > 5 || brandFile.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {brandText.length > 5 || brandFile.length > 0 ? '✓ 15 pts' : '0 pts'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery specs</span>
                <span style={{ color: deliveryFormat ? 'var(--success)' : 'var(--text-muted)' }}>
                  {deliveryFormat ? '✓ 15 pts' : '0 pts'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Approval contacts</span>
                <span style={{ color: approvalContacts.some(c => c.name !== '' && c.email !== '') ? 'var(--success)' : 'var(--text-muted)' }}>
                  {approvalContacts.some(c => c.name !== '' && c.email !== '') ? '✓ 15 pts' : '0 pts'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Project deadline</span>
                <span style={{ color: deadline ? 'var(--success)' : 'var(--text-muted)' }}>
                  {deadline ? '✓ 10 pts' : '0 pts'}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Card */}
          <div className="card">
            <button 
              onClick={handleSubmitClick} 
              disabled={submitLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem' }}
            >
              {submitLoading ? 'Submitting...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Save size={18} />
                  {isEditMode ? 'Save Brief Changes' : 'Submit Production Brief'}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setSelectedBriefId(null); setCurrentPage('briefs'); }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={showConfirmSubmit}
        title={completenessScore < 80 ? "Submit incomplete brief?" : "Submit this production brief?"}
        message={completenessScore < 80 
          ? `Your brief completeness score is only ${completenessScore}%. It will remain in 'draft' mode until it satisfies the 80% kickoff gate. Proceed anyways?` 
          : "This brief will be evaluated by the studio pre-production rules and client notification emails will be sent out. Confirm kickoff submission?"}
        confirmText={submitLoading ? "Submitting..." : "Yes, Submit"}
        cancelText="No, Go Back"
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        isDanger={completenessScore < 80}
      />

      {/* Feedback Toast */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}
    </div>
  );
}
