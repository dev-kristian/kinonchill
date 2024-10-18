// components/AddToHomeScreen.tsx

import React from 'react';
import { Button } from '@/components/ui/button';

const AddToHomeScreen = () => {
  const showInstructions = () => {
    alert("To add this app to your home screen and enable notifications:\n\n1. Tap the share button at the bottom of your screen\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' in the top right corner\n4. Once added, open the app from your home screen to enable notifications");
  };

  return (
    <Button onClick={showInstructions}>
      How to Add to Home Screen
    </Button>
  );
};

export default AddToHomeScreen;