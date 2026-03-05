// import { useEffect } from "react";
// import socketService from "../services/socketService";

// export const useSocket = (topic: string, callback: (data: any) => void) => {
//   useEffect(() => {
//     const handler = (data: any) => {
//       try {
//         const outer = JSON.parse(data);
//         const inner = JSON.parse(outer.data);

//         callback(inner);
//       } catch (e) {
//         console.error("Socket Parse Error", e);
//       }
//     };

//     socketService.subscribe(topic, handler);

//     return () => {
//       socketService.unsubscribe(topic, handler);
//     };
//   }, [topic]);
// };

import { useEffect } from "react";
import socketService from "../services/socketService";

export const useSocket = (topic: string, callback: (data: any) => void) => {
  useEffect(() => {
    const handler = (body: any) => {
      try {
        // body already parsed by socketService
        const inner = body?.data ? JSON.parse(body.data) : body;

        callback(inner);
      } catch (e) {
        console.error("Socket Parse Error", e);
      }
    };

    socketService.subscribe(topic, handler);

    // return () => {
    //   socketService.unsubscribe(topic, handler);
    // };
  }, [topic, callback]);
};
