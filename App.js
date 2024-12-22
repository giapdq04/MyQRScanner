import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { Button, FlatList, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { LinkPreview } from '@flyerhq/react-native-link-preview'

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [isActive, setIsActive] = useState(true)
  const bottomSheetRef = useRef(null);
  const newCodeRef = useRef(null);
  const [newCode, setNewCode] = useState({})
  const [codeList, setCodeList] = useState([]);
  const [zoomValue, setZoomValue] = useState(0)
  const [isZoom, setIsZoom] = useState(false)
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);

  const handleSheetChanges = useCallback((index) => {
    if (index == -1) { // trường hợp đóng bottom sheet
      setIsActive(true)
    }
  }, []);

  const handleNewCodeSheetChanges = useCallback((index) => {
    if (index == -1) {
      setIsActive(true)
      setNewCode({})
    }
  })

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

  const handleBarCodeScanned = ({ data, type }) => {
    console.log(data, type);

    setIsActive(!isActive)
    setNewCode({
      date: new Date().toISOString(),
      data,
    })
    setCodeList((prev) => (
      [
        {
          date: new Date().toISOString(),
          data,
        },
        ...prev
      ]
    ))
    newCodeRef.current.expand();
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

  const handleLinkPress = (link) => {
    Linking.openURL(link);
  }

  const renderItem = ({ item }) => {
    return (
      <View style={{
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
      }}>
        <Text>{formatDate(item.date)}</Text>
        <Text
          style={{
            color: isLink(item.data) ? 'blue' : 'black',
            textDecorationLine: isLink(item.data) ? 'underline' : 'none',
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
          onPress={() => handleLinkPress(item.data)}>{item.data}</Text>
      </View>
    )
  }

  const toggleCamera = () => {
    setIsActive(!isActive)
  }

  const openHistory = () => {
    setIsActive(false)
    bottomSheetRef.current.expand();
  }

  const closeAllBottomSheet = () => {
    bottomSheetRef.current.close();
    newCodeRef.current.close();
  }


  return (
    <GestureHandlerRootView style={{
      flex: 1,
      justifyContent: 'center',
    }}>
      <StatusBar style="light" />
      {
        isActive ? (
          <CameraView
            zoom={zoomValue}
            barcodeScannerSettings={{
              barcodeTypes: [
                'aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a',
              ],
            }}
            onBarcodeScanned={handleBarCodeScanned}
            style={{
              flex: 1,
              justifyContent: 'center',
            }}
          >
          </CameraView>
        ) : (
          <Pressable
            onPress={closeAllBottomSheet}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000'
            }}>
            <Text style={{
              color: '#fff',
            }}>Camera đã bị tắt</Text>

          </Pressable>
        )
      }

      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        height: '15%',
        justifyContent: 'space-between',
      }}>
        <View style={{
          alignItems: 'center',
        }}>
          <Slider
            style={{ width: '80%', display: isZoom ? 'flex' : 'none' }}
            progress={progress}
            minimumValue={min}
            maximumValue={max}
            onSlidingComplete={(value) => {
              setZoomValue(value / 100)
            }}
            containerStyle={{
              borderRadius: 50
            }}
          />
        </View>

        <View style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-around',
        }}>
          <TouchableOpacity
            onPress={openHistory}
            style={{
              backgroundColor: '#fff', width: 50, height: 50, borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <FontAwesome name='history' size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!isZoom) {
                setIsActive(true)
              }
              setIsZoom(!isZoom)
            }}
            style={{
              backgroundColor: '#fff', width: 50, height: 50, borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Feather name={isZoom ? 'zoom-out' : "zoom-in"} size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleCamera}
            style={{
              backgroundColor: '#fff', width: 50, height: 50, borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Feather name={isActive ? 'camera-off' : 'camera'} size={24} color="#000" />
          </TouchableOpacity>
        </View>

      </View>


      <BottomSheet
        ref={newCodeRef}
        onChange={handleNewCodeSheetChanges}
        snapPoints={['20%', '60%']}
        enablePanDownToClose={true}
        index={-1}
      >
        <BottomSheetView style={{
          flex: 1,
          padding: 36,
          alignItems: 'center',
        }}>
          <Text>Data: {newCode.data}</Text>

          <Text>Date: {formatDate(newCode.date)}</Text>
          <LinkPreview
            text='Đi đến https://www.youtube.com/watch?v=JqUPAkbvRJA' />
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={['50%']}
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
