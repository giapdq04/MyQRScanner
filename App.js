import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { Button, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true)
  const bottomSheetRef = useRef(null);
  const [codeList, setCodeList] = useState([]);

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

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
    console.log('handleBarCodeScanned', data);

    setScanned(true);
    setCodeList((prev) => (
      [
        {
          date: new Date().toISOString(),
          data,
        },
        ...prev
      ]
    ))

    if (data.startsWith('http')) {
      Linking.openURL(data);
      bottomSheetRef.current.collapse();
      return
    }
    bottomSheetRef.current.expand();
  };

  const isLink = (data) => {
    if (data.startsWith('http')) {
      return true;
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

  const renderItem = ({ item }) => {
    return (
      <View style={{
        // flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
      }}>
        <Text>{formatDate(item.date)}</Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          onPress={() => Linking.openURL(item.data)}>{item.data}</Text>
      </View>
    )
  }

  const toggleCamera = () => {
    setIsActive(!isActive)
  }

  return (
    <GestureHandlerRootView style={{
      flex: 1,
      justifyContent: 'center',
    }}>
      <StatusBar style="light"
        networkActivityIndicatorVisible={true}
      />
      {
        isActive ? (
          <CameraView
            barcodeScannerSettings={{
              barcodeTypes: [
                'aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a',
              ],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{
              flex: 1,
              justifyContent: 'center',
            }}
          >
          </CameraView>
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000'
          }}>
            <Text style={{
              color: '#fff',
            }}>Camera đã bị tắt</Text>

          </View>
        )
      }

      {scanned && (
        <TouchableOpacity
          onPress={() => setScanned(false)}
          style={{
            position: 'absolute', bottom: 20, left: 20, backgroundColor: '#fff', width: 50, height: 50, borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <AntDesign name="back" size={24} color="#000" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={toggleCamera}
        style={{
          position: 'absolute', bottom: 20, right: 20, backgroundColor: '#fff', width: 50, height: 50, borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <Feather name={isActive ? 'camera-off' : 'camera'} size={24} color="#000" />
      </TouchableOpacity>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={['10%', '25%', '50%']}
        enablePanDownToClose={true}
        index={-1}
      >
        <BottomSheetView style={{
          flex: 1,
          padding: 36,
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
          }}>
            <FontAwesome name="history" size={24} color="#333" />
            <Text style={{
              marginLeft: 8
            }}>Lịch sử</Text>
          </View>

          <FlatList
            data={codeList}
            renderItem={({ item }) => renderItem({ item })}
            keyExtractor={(item) => item.date}
          />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
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
