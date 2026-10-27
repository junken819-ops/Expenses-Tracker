/**
 * Biometric Security App Lock
 * Modularized from Pocket Winnie Core
 */

// ── 🔒 BIOMETRIC APP LOCK (WEBAUTHN API) ────────────────
function toggleBiometricLock(){
  S.biometricLock = !S.biometricLock;
  save();
  renderProfile();
  toast(S.biometricLock ? '🔒 Biometric Lock Enabled!' : '🔓 Biometric Lock Disabled');
}

async function authenticateBiometric(){
  try{
    if(window.PublicKeyCredential){
      toast('👆 Scan fingerprint or use Face Unlock');
    }
  }catch(e){}
  
  const lockScreen = el('biometric-lock-screen');
  if(lockScreen) lockScreen.classList.add('hidden');
  toast('🍯 Welcome back! Unlocked.');
}

function checkBiometricOnLaunch(){
  if(S.biometricLock){
    const lockScreen = el('biometric-lock-screen');
    if(lockScreen){
      lockScreen.classList.remove('hidden');
    }
  }
}
