import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from '../components/Button';
import { ArrowLeft, Key, ExternalLink, Shield, CheckCircle } from 'lucide-react';

interface ControllerAuthorizationProps {
  onBack: () => void;
}

export function ControllerAuthorization({ onBack }: ControllerAuthorizationProps) {
  const { address, isConnected, upAddress } = useWeb3();
  const [step, setStep] = useState(1);

  const openClawAuthUrl = 'https://lukso-network.github.io/openclaw-universalprofile-skill/';

  const handleOpenAuth = () => {
    window.open(openClawAuthUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="text-center py-20">
            <Key className="w-16 h-16 text-pink-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8">
              Please connect your wallet first to add a controller to your Universal Profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 mb-6">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Add Controller</h1>
          <p className="text-gray-400">
            Grant permissions to an AI agent or external controller
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s <= step
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 ${
                    s < step ? 'bg-pink-500' : 'bg-gray-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-500" />
              What is a Controller?
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                A controller is an address that has permission to execute transactions through your 
                Universal Profile. This allows AI agents to:
              </p>
              <ul className="space-y-2 ml-5">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  Execute transactions on your behalf
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  Interact with dApps using your identity
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  Manage assets within defined permissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  Operate autonomously (for AI agents)
                </li>
              </ul>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
                <p className="text-yellow-400 text-sm">
                  <strong>Security Note:</strong> You maintain full control. You can revoke 
                  controller permissions at any time through your Universal Profile.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full mt-8"
              size="lg"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Authorization */}
        {step === 2 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Authorize Controller</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Your Universal Profile</p>
                <p className="font-mono text-sm text-white break-all">{upAddress || address}</p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  We use the official OpenClaw Universal Profile authorization tool to securely 
                  add controllers to your UP:
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    This tool generates the proper LSP6 permission payload for your controller 
                    address. No manual encoding needed.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleOpenAuth}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Authorization Tool
              </Button>

              <div className="text-center text-sm text-gray-500">
                You'll be redirected to complete the authorization
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => setStep(1)}
                variant="ghost"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Authorization Complete</h2>
            <p className="text-gray-300 mb-6">
              Your controller has been added to your Universal Profile. 
              The AI agent can now operate within the granted permissions.
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-400">Connected UP</p>
              <p className="font-mono text-sm text-white break-all">{upAddress || address}</p>
            </div>
            <Button onClick={onBack} className="w-full">
              Return to Home
            </Button>
          </div>
        )}

        {/* Resources */}
        <div className="mt-12 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a 
                href="https://github.com/emmet-bot/openclaw-skills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                OpenClaw UP Skill Documentation
              </a>
            </li>
            <li>
              <a 
                href="https://docs.lukso.tech/standards/access-control/lsp6-key-manager" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                LSP6 Key Manager Documentation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
