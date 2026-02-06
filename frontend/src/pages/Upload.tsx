import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  Code2, 
  FileCode, 
  Hash, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  X,
  Info,
  Terminal
} from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import Button from '../components/Button'

interface FormData {
  name: string
  description: string
  code: string
  language: string
  tags: string[]
  version: string
  license: string
}

interface FormErrors {
  name?: string
  description?: string
  code?: string
  language?: string
}

const languages = [
  { value: 'solidity', label: 'Solidity', color: 'text-blue-400' },
  { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { value: 'typescript', label: 'TypeScript', color: 'text-blue-300' },
  { value: 'python', label: 'Python', color: 'text-green-400' },
  { value: 'rust', label: 'Rust', color: 'text-orange-400' },
  { value: 'go', label: 'Go', color: 'text-cyan-400' },
  { value: 'java', label: 'Java', color: 'text-red-400' },
  { value: 'cpp', label: 'C++', color: 'text-purple-400' },
  { value: 'other', label: 'Other', color: 'text-slate-400' }
]

const licenses = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'Unlicense',
  'Custom'
]

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Code' },
  { id: 3, label: 'Review' }
]

const UploadPage: React.FC = () => {
  const { isConnected, address } = useWeb3()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    language: 'solidity',
    tags: [],
    version: '1.0.0',
    license: 'MIT'
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required'
      } else if (formData.name.length < 3) {
        newErrors.name = 'Name must be at least 3 characters'
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required'
      } else if (formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters'
      }
    }
    
    if (step === 2) {
      if (!formData.code.trim()) {
        newErrors.code = 'Code is required'
      } else if (formData.code.length < 50) {
        newErrors.code = 'Code must be at least 50 characters'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setErrors({})
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async () => {
    setIsUploading(true)
    setUploadStatus('uploading')
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(i)
    }
    
    // Simulate success
    setTimeout(() => {
      setUploadStatus('success')
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    }, 500)
  }

  const getLanguageLabel = (value: string) => {
    return languages.find(l => l.value === value)?.label || value
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-slate-400 mb-6">
            Please connect your wallet to upload code snippets. We support both Universal Profile and MetaMask.
          </p>
        </div>
      </div>
    )
  }

  if (uploadStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Upload Successful!</h2>
          <p className="text-slate-400">
            Your code has been uploaded to IPFS and registered on the blockchain.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Post Your Code</h1>
          </div>
          <p className="text-slate-400 ml-13 sm:ml-14">
            Share your smart contract code with the community
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      currentStep > step.id 
                        ? 'bg-emerald-500 text-white' 
                        : currentStep === step.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="glass-card p-6 sm:p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Code Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800/50 border ${
                    errors.name ? 'border-red-500/50' : 'border-slate-700/50'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                  placeholder="e.g., ERC20 Token Implementation"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800/50 border ${
                    errors.description ? 'border-red-500/50' : 'border-slate-700/50'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none`}
                  placeholder="Describe what your code does, its features, and use cases..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Language <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  License
                </label>
                <select
                  value={formData.license}
                  onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                >
                  {licenses.map(license => (
                    <option key={license} value={license}>
                      {license}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Code */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">Code Formatting</p>
                  <p className="text-sm text-blue-400/80">
                    Make sure your code is properly formatted and includes comments for better readability.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Code <span className="text-red-400">*</span>
                </label>
                <div className={`relative rounded-xl overflow-hidden border ${
                  errors.code ? 'border-red-500/50' : 'border-slate-700/50'
                }`}>
                  {/* Code Editor Header */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-slate-700/50">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500 font-mono">
                      {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '_') : 'untitled'}.{formData.language === 'solidity' ? 'sol' : formData.language}
                    </span>
                  </div>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    rows={16}
                    className="w-full px-4 py-4 bg-slate-950 text-slate-300 font-mono text-sm focus:outline-none resize-none"
                    placeholder="// Paste your code here..."
                    spellCheck={false}
                  />
                </div>
                {errors.code && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.code}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {formData.code.length} characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <p className="text-emerald-300 font-medium">Ready to upload!</p>
                </div>
                <p className="text-emerald-400/80 text-sm mt-1 ml-8">
                  Review your code details below before submitting.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Name</h3>
                  <p className="text-white">{formData.name}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Description</h3>
                  <p className="text-white text-sm">{formData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Language</h3>
                    <p className="text-white">{getLanguageLabel(formData.language)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Version</h3>
                    <p className="text-white">{formData.version}</p>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Code Preview</h3>
                  <pre className="text-xs text-slate-400 font-mono overflow-x-auto max-h-40">
                    <code>{formData.code.slice(0, 500)}{formData.code.length > 500 ? '...' : ''}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-700/30">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:from-blue-500 hover:to-cyan-500 transition-all"
              >
                Next
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Upload Code
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-500 mt-2">
                {uploadProgress < 50 ? 'Uploading to IPFS...' : 'Registering on blockchain...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadPage
