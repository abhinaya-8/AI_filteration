import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  getResumeTemplates,
  scoreResume,
  suggestBullet,
  extractSkills,
} from '../services/api'

const initialResumeData = {
  templateId: 'classic',
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: '',
  experienceBullets: ['', '', '', ''],
  projects: [
    { name: '', description: '' },
    { name: '', description: '' },
  ],
  education: '',
  certifications: '',
}

export default function ResumeBuilder() {
  const [templates, setTemplates] = useState([])
  const [resumeData, setResumeData] = useState(initialResumeData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    getResumeTemplates()
      .then((res) => {
        if (cancelled) return
        setTemplates(res.data)
        if (res.data && res.data.length > 0) {
          setResumeData((prev) => ({ ...prev, templateId: res.data[0].id }))
        }
      })
      .catch(() => {
        if (!cancelled) setTemplates([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const setField = (key, value) => {
    setResumeData((prev) => ({ ...prev, [key]: value }))
  }

  const updateBullet = (index, value) => {
    const bullets = [...resumeData.experienceBullets]
    bullets[index] = value
    setField('experienceBullets', bullets)
  }

  const updateProject = (index, field, value) => {
    const projects = resumeData.projects.map((project, i) =>
      i === index ? { ...project, [field]: value } : project
    )
    setField('projects', projects)
  }

  const handleExtractSkills = async () => {
    setSaving(true)
    setMessage('')
    const text = resumeData.projects.map((p) => `${p.name} ${p.description}`).join(' ')
    try {
      const res = await extractSkills(text)
      const currentSkills = resumeData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      const combined = Array.from(new Set([...currentSkills, ...(res.data.skills || [])]))
      setField('skills', combined.join(', '))
      setMessage('Skills extracted from project descriptions.')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to extract skills')
    } finally {
      setSaving(false)
    }
  }

  const handleImproveBullet = async (index) => {
    const bullet = resumeData.experienceBullets[index]
    if (!bullet.trim()) return
    setSaving(true)
    setMessage('')
    try {
      const res = await suggestBullet(bullet)
      updateBullet(index, res.data.suggestion)
      setMessage('Bullet point improved.')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to improve bullet')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPdf = async () => {
    const preview = document.getElementById('resume-preview')
    if (!preview) return
    setSaving(true)
    setMessage('')

    // html2canvas suffers from a known bug where it clips elements if the user has scrolled down. 
    // Scrolling to the top of the page before capturing ensures the entire element is captured.
    const currentScroll = window.scrollY
    window.scrollTo(0, 0)

    // Temporarily remove web-UI styling and strict aspect ratio to capture all content
    const originalClassName = preview.className
    preview.className = preview.className
      .replace('aspect-[1.414]', '')
      .replace('rounded-2xl', '')
      .replace('border border-slate-200', 'border-transparent')
      .replace('shadow-sm', '')

    try {
      const canvas = await html2canvas(preview, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        scrollY: 0
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = pdf.getImageProperties(imgData)
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height)
      const imgWidth = imgProps.width * ratio
      const imgHeight = imgProps.height * ratio
      const marginX = (pageWidth - imgWidth) / 2
      pdf.addImage(imgData, 'PNG', marginX, 0, imgWidth, imgHeight)
      pdf.save(`${resumeData.fullName || 'resume'}-resume.pdf`)
      
      // Warn the user about ATS optimization if they use this method
      setMessage('PDF exported! Note: This is an image-based PDF. For ATS parsing, use "Print resume" and Save as PDF.')
    } catch (err) {
      setMessage('Unable to export PDF. Try again or use browser print.')
    } finally {
      preview.className = originalClassName
      window.scrollTo(0, currentScroll)
      setSaving(false)
    }
  }

  const renderExperience = () => (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Experience</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc list-inside">
        {resumeData.experienceBullets.some((b) => b.trim()) ? (
          resumeData.experienceBullets.filter((b) => b.trim()).map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))
        ) : (
          <li>Add impact-driven bullets from your experience.</li>
        )}
      </ul>
    </div>
  )

  const renderProjects = () => (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Projects</h3>
      <div className="mt-3 space-y-4 text-sm text-slate-700">
        {resumeData.projects.some((p) => p.name.trim() || p.description.trim()) ? (
          resumeData.projects.map((project, index) => (
            <div key={index}>
              <p className="font-semibold text-slate-900">{project.name || `Project ${index + 1}`}</p>
              <p>{project.description || 'Project description and impact.'}</p>
            </div>
          ))
        ) : (
          <p>Describe your most relevant projects and your contributions.</p>
        )}
      </div>
    </div>
  )

  const renderSidebar = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Contact</h3>
        <p className="text-sm text-slate-700">{resumeData.email || 'email@example.com'}</p>
        <p className="text-sm text-slate-700">{resumeData.phone || '(000) 000-0000'}</p>
        <p className="text-sm text-slate-700">{resumeData.location || 'City, Country'}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Skills</h3>
        <p className="text-sm text-slate-700">{resumeData.skills || 'Skill1, Skill2, Skill3'}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Education</h3>
        <p className="text-sm text-slate-700">{resumeData.education || 'Degree, University, Year'}</p>
      </div>
      {resumeData.certifications.trim() && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Certifications</h3>
          <p className="text-sm text-slate-700">{resumeData.certifications}</p>
        </div>
      )}
    </div>
  )

  const renderResumePreview = () => {
    const contactLine = `${resumeData.email || 'email@example.com'} · ${resumeData.phone || '(000) 000-0000'} · ${resumeData.location || 'City, Country'}`

    switch (resumeData.templateId) {
      case 'modern':
        return (
          <div id="resume-preview" className="w-full max-w-[794px] aspect-[1.414] mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
            <div className="mb-6 flex flex-row gap-4">
              <div className="w-[55%] rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Modern Minimal</p>
                <p className="mt-3 text-3xl font-semibold">{resumeData.fullName || 'Your Name'}</p>
                <p className="mt-2 text-sm text-slate-300">{resumeData.title || 'Professional Title'}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">Contact</p>
                <p className="mt-2 text-sm text-slate-200">{resumeData.email || 'email@example.com'}</p>
                <p className="text-sm text-slate-200">{resumeData.phone || '(000) 000-0000'}</p>
                <p className="text-sm text-slate-200">{resumeData.location || 'City, Country'}</p>
              </div>
              <div className="w-[45%] rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-row gap-3">
                  <div className="flex-1">
                    <h3 className="text-xs uppercase tracking-[0.24em] text-slate-500">Summary</h3>
                    <p className="mt-2 text-sm text-slate-700">{resumeData.summary || 'Write a concise summary highlighting your top strengths and goals.'}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs uppercase tracking-[0.24em] text-slate-500">Skills</h3>
                    <p className="mt-2 text-sm text-slate-700">{resumeData.skills || 'Skill1, Skill2, Skill3'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-6">
              <div className="w-[58%] space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Experience</h3>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    {resumeData.experienceBullets.some((b) => b.trim()) ? (
                      resumeData.experienceBullets.filter((b) => b.trim()).map((bullet, index) => (
                        <p key={index}>• {bullet}</p>
                      ))
                    ) : (
                      <p>Add impact-driven bullets from your experience.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Projects</h3>
                  <div className="mt-3 space-y-4 text-sm text-slate-700">
                    {resumeData.projects.some((p) => p.name.trim() || p.description.trim()) ? (
                      resumeData.projects.map((project, index) => (
                        <div key={index}>
                          <p className="font-semibold text-slate-900">{project.name || `Project ${index + 1}`}</p>
                          <p>{project.description || 'Project description and impact.'}</p>
                        </div>
                      ))
                    ) : (
                      <p>Describe your most relevant projects and your contributions.</p>
                    )}
                  </div>
                </div>
              </div>
              <aside className="w-[42%] space-y-6 rounded-3xl border border-slate-200 bg-blue-900 p-5 text-sm text-slate-100">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.24em] text-blue-200">Core Competencies</h3>
                  <p className="mt-3 text-sm">{resumeData.skills || 'Python, JavaScript, React, SQL'}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.24em] text-blue-200">Education</h3>
                  <p className="mt-3 text-sm text-slate-100">{resumeData.education || 'Degree, University, Year'}</p>
                </div>
                {resumeData.certifications.trim() && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.24em] text-blue-200">Certifications</h3>
                    <p className="mt-3 text-sm text-slate-100">{resumeData.certifications}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-xs uppercase tracking-[0.24em] text-blue-200">Professional Summary</h3>
                  <p className="mt-3 text-sm text-slate-100">{resumeData.summary || 'Strong experience delivering measurable results across fast-paced product teams.'}</p>
                </div>
              </aside>
            </div>
          </div>
        )
      case 'executive':
        return (
          <div id="resume-preview" className="w-full max-w-[794px] aspect-[1.414] mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
            <div className="flex flex-row gap-6">
              <aside className="w-[35%] space-y-6 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-slate-100">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-800 flex items-center justify-center text-xl font-semibold text-white">{(resumeData.fullName || 'Your Name').split(' ').map((n) => n[0]).slice(0,2).join('')}</div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Profile</p>
                    <p className="mt-3 text-lg font-semibold">{resumeData.fullName || 'Your Name'}</p>
                    <p className="mt-1 text-sm text-slate-300">{resumeData.title || 'Software Engineer'}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-200">
                  <p className="uppercase tracking-[0.24em] text-slate-500">Contact</p>
                  <p>{resumeData.email || 'email@example.com'}</p>
                  <p>{resumeData.phone || '(000) 000-0000'}</p>
                  <p>{resumeData.location || 'City, Country'}</p>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-200">
                  <p className="uppercase tracking-[0.24em] text-slate-500">Skills</p>
                  <p>{resumeData.skills || 'Python, React, SQL, AWS'}</p>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-200">
                  <p className="uppercase tracking-[0.24em] text-slate-500">Languages</p>
                  <p>English, Spanish</p>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-200">
                  <p className="uppercase tracking-[0.24em] text-slate-500">Hobbies</p>
                  <p>Design, Travel, Reading</p>
                </div>
              </aside>
              <div className="w-[65%] space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Executive Clean</p>
                  <div className="mt-4">
                    <p className="text-3xl font-semibold text-slate-900">{resumeData.fullName || 'Your Name'}</p>
                    <p className="mt-2 text-sm text-slate-600">{resumeData.title || 'Experienced Professional'}</p>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{resumeData.summary || 'A proven leader with a strong track record of delivering business results through strategy, execution, and team development.'}</p>
                </div>
                <div className="flex flex-row gap-6">
                  <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Experience</h3>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      {resumeData.experienceBullets.some((b) => b.trim()) ? (
                        resumeData.experienceBullets.filter((b) => b.trim()).map((bullet, index) => (
                          <p key={index}>• {bullet}</p>
                        ))
                      ) : (
                        <p>Add impact-driven bullets from your experience.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Projects</h3>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      {resumeData.projects.some((p) => p.name.trim() || p.description.trim()) ? (
                        resumeData.projects.map((project, index) => (
                          <div key={index}>
                            <p className="font-semibold text-slate-900">{project.name || `Project ${index + 1}`}</p>
                            <p>{project.description || 'Project description and impact.'}</p>
                          </div>
                        ))
                      ) : (
                        <p>Describe your most relevant projects and your contributions.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Education</h3>
                  <p className="mt-3 text-sm text-slate-700">{resumeData.education || 'Degree, University, Year'}</p>
                  {resumeData.certifications.trim() && (
                    <p className="mt-3 text-sm text-slate-700">{resumeData.certifications}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      case 'polished':
        return (
          <div id="resume-preview" className="w-full max-w-[794px] aspect-[1.414] mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
            <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-100 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Polished Layout</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{resumeData.fullName || 'Your Name'}</p>
                  <p className="mt-2 text-sm text-slate-600">{resumeData.title || 'Professional Title'}</p>
                </div>
                <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <p className="font-semibold uppercase tracking-[0.16em] text-slate-900">Contact</p>
                  <p className="mt-2">{resumeData.email || 'email@example.com'}</p>
                  <p>{resumeData.phone || '(000) 000-0000'}</p>
                  <p>{resumeData.location || 'City, Country'}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-6">
              <div className="w-[55%] space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Profile</h3>
                  <p className="mt-3 text-sm text-slate-700">{resumeData.summary || 'Write a concise summary highlighting your top strengths and goals.'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Experience</h3>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    {resumeData.experienceBullets.some((b) => b.trim()) ? (
                      resumeData.experienceBullets.filter((b) => b.trim()).map((bullet, index) => (
                        <p key={index}>• {bullet}</p>
                      ))
                    ) : (
                      <p>Add impact-driven bullets from your experience.</p>
                    )}
                  </div>
                </div>
              </div>
              <aside className="w-[45%] space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Skills</h3>
                  <p className="mt-3 text-sm text-slate-700">{resumeData.skills || 'Skill1, Skill2, Skill3'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Education</h3>
                  <p className="mt-3 text-sm text-slate-700">{resumeData.education || 'Degree, University, Year'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Projects</h3>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    {resumeData.projects.some((p) => p.name.trim() || p.description.trim()) ? (
                      resumeData.projects.map((project, index) => (
                        <div key={index}>
                          <p className="font-semibold text-slate-900">{project.name || `Project ${index + 1}`}</p>
                          <p>{project.description || 'Project description and impact.'}</p>
                        </div>
                      ))
                    ) : (
                      <p>Describe your most relevant projects and your contributions.</p>
                    )}
                  </div>
                </div>
                {resumeData.certifications.trim() && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Certifications</h3>
                    <p className="mt-3 text-sm text-slate-700">{resumeData.certifications}</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        )
      case 'classic':
      default:
        return (
          <div id="resume-preview" className="w-full max-w-[794px] aspect-[1.414] mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
            <div className="mb-6 flex flex-row gap-6">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Classic Professional</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{resumeData.fullName || 'Your Name'}</p>
                <p className="mt-2 text-sm text-slate-600">{resumeData.title || 'Professional Title'}</p>
                <p className="mt-4 text-sm text-slate-600">{resumeData.summary || 'Write a concise summary highlighting your top strengths and goals.'}</p>
              </div>
              <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold uppercase tracking-[0.2em] text-slate-700">Contact</p>
                    <p className="mt-2">{resumeData.email || 'email@example.com'}</p>
                    <p>{resumeData.phone || '(000) 000-0000'}</p>
                    <p>{resumeData.location || 'City, Country'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.2em] text-slate-700">Skills</p>
                    <p className="mt-2">{resumeData.skills || 'Skill1, Skill2, Skill3'}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.2em] text-slate-700">Education</p>
                    <p className="mt-2">{resumeData.education || 'Degree, University, Year'}</p>
                  </div>
                  {resumeData.certifications.trim() && (
                    <div>
                      <p className="font-semibold uppercase tracking-[0.2em] text-slate-700">Certifications</p>
                      <p className="mt-2">{resumeData.certifications}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Experience</h3>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  {resumeData.experienceBullets.some((b) => b.trim()) ? (
                    resumeData.experienceBullets.filter((b) => b.trim()).map((bullet, index) => (
                      <p key={index}>• {bullet}</p>
                    ))
                  ) : (
                    <p>Add impact-driven bullets from your experience.</p>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Projects</h3>
                <div className="mt-3 space-y-4 text-sm text-slate-700">
                  {resumeData.projects.some((p) => p.name.trim() || p.description.trim()) ? (
                    resumeData.projects.map((project, index) => (
                      <div key={index}>
                        <p className="font-semibold text-slate-900">{project.name || `Project ${index + 1}`}</p>
                        <p>{project.description || 'Project description and impact.'}</p>
                      </div>
                    ))
                  ) : (
                    <p>Describe your most relevant projects and your contributions.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0 !important;
            padding: 10mm !important;
            border: none;
          }
        }
      `}</style>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resume Builder</h1>
          <p className="text-slate-500">Create ATS-friendly applicant resumes, get instant suggestions, and download as PDF.</p>
        </div>
        <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">← Back to dashboard</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Select a template</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setField('templateId', template.id)}
                  className={`rounded-2xl border p-4 text-left transition ${resumeData.templateId === template.id ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className="font-semibold text-slate-800">{template.name}</p>
                  <p className="text-slate-500 text-sm mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Contact & summary</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input value={resumeData.fullName} onChange={(e) => setField('fullName', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500" placeholder="Jane Doe" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Job title</span>
                <input value={resumeData.title} onChange={(e) => setField('title', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500" placeholder="Software Engineer" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input value={resumeData.email} onChange={(e) => setField('email', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500" placeholder="jane@example.com" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone</span>
                <input value={resumeData.phone} onChange={(e) => setField('phone', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500" placeholder="(123) 456-7890" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Location</span>
                <input value={resumeData.location} onChange={(e) => setField('location', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500" placeholder="City, Country" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Professional summary</span>
                <textarea value={resumeData.summary} onChange={(e) => setField('summary', e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-500" placeholder="Summarize your strengths, achievements, and what you bring to the role." />
              </label>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Experience bullets</h2>
                <p className="text-slate-500 text-sm">Use strong action verbs and keep each bullet impact-focused.</p>
              </div>
            </div>
            <div className="space-y-4">
              {resumeData.experienceBullets.map((bullet, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto] items-start">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Bullet {index + 1}</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => updateBullet(index, e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                      placeholder="Designed and implemented..."
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveBullet(index)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Improve
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Projects & skills</h2>
                <p className="text-slate-500 text-sm">Describe your projects so the builder can extract relevant ATS keywords.</p>
              </div>
              <button
                type="button"
                onClick={handleExtractSkills}
                className="rounded-xl border border-primary-600 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
              >
                Extract skills
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Project name</span>
                    <input
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500"
                      placeholder="Inventory dashboard"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Project description</span>
                    <textarea
                      rows={2}
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                      placeholder="Built a dashboard to track inventory metrics using React and Flask."
                    />
                  </label>
                </div>
              ))}
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Skills</span>
                <input
                  value={resumeData.skills}
                  onChange={(e) => setField('skills', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-primary-500"
                  placeholder="Python, React, SQL, communication"
                />
              </label>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Education & certifications</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Education</span>
                <textarea
                  rows={2}
                  value={resumeData.education}
                  onChange={(e) => setField('education', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                  placeholder="B.Sc. in Computer Science, XYZ University"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Certifications</span>
                <textarea
                  rows={2}
                  value={resumeData.certifications}
                  onChange={(e) => setField('certifications', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                  placeholder="AWS Certified Developer, Scrum Master"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {message && <p className="text-sm text-slate-600">{message}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {saving ? 'Exporting…' : 'Export PDF'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Print resume
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ready preview</h2>
            {renderResumePreview()}
          </section>
        </aside>
      </div>
    </div>
  )
}
