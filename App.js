import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Linking, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    {
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
        }}>
          <Text style={styles.message}>Chúng tôi cần quyền truy cập vào Camera</Text>
          <Button onPress={requestPermission} title="Cho phép" />
        </View>
      )
    }

  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    Linking.openURL(data);
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
    }}>
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ['aztec',
            'ean13',
            'ean8',
            'qr',
            'pdf417',
            'upc_e',
            'datamatrix',
            'code39',
            'code93',
            'itf14',
            'codabar',
            'code128',
            'upc_a',],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}>
      </CameraView>
      {scanned && (
        <Button
          title="Quét lại"
          onPress={() => setScanned(false)}
          style={{ position: 'absolute', bottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
