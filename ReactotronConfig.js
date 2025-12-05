import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: "teamapp",
  })
  .useReactNative({
    asyncStorage: false,
    editor: false,

    errors: {
      veto: (error) => {
        if (error?.message?.includes("parseErrorStack is not a function")) {
          return true;
        }
        return false;
      },
    },

    networking: {
      ignoreUrls: /symbolicate/,
    },
    overlay: false,
  })
  .connect();

export default reactotron;
