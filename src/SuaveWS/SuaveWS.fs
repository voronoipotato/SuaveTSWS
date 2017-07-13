open System
open System.Globalization
open System.Threading
open Suave
open Suave.Http
open Suave.Operators
open Suave.Filters
open Suave.Successful
open Suave.Files
open Suave.RequestErrors
open Suave.Logging
open Suave.Utils

open Suave.Sockets
open Suave.Sockets.Control
open Suave.WebSocket

module SuaveWS =

  let ws (webSocket : WebSocket) (context: HttpContext) =
    socket {
      // if `loop` is set to false, the server will stop receiving messages
      let mutable loop = true
      while loop do
        // the server will wait for a message to be received without blocking the thread
        let! msg = webSocket.read()
        match msg with
        // the message has type (Opcode * byte [] * bool)
        //
        // Opcode type:
        //   type Opcode = Continuation | Text | Binary | Reserved | Close | Ping | Pong
        //
        // byte [] contains the actual message
        //
        // the last element is the FIN byte, explained later
        | (Text, data, true) ->
          // the message can be converted to a string
          let clientMessage = UTF8.toString data
          let clientTime =  (float)(Int64.Parse(clientMessage)) |> DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddHours(-4.0).AddMilliseconds
          let serverTime = DateTime.Now
          let formatTime (t :DateTime) = t.ToString "h:mm:ss.fff"
          let latency = clientTime - serverTime
          let response = sprintf "Latency (%s ms) Client Time %s : Server Time %s " (latency.ToString "fff") (formatTime clientTime) (formatTime serverTime)
          // the response needs to be converted to a ByteSegment
          let byteResponse =
            response
            |> System.Text.Encoding.ASCII.GetBytes
            |> ByteSegment
          // the `send` function sends a message back to the client
          do! webSocket.send Text byteResponse true
        | (Close, _, _) ->
          let emptyResponse = [||] |> ByteSegment
          do! webSocket.send Close emptyResponse true
          // after sending a Close message, stop the loop
          loop <- false
        | _ -> ()
      }

  let app : WebPart = 
    choose [
      path "/websocket" >=> handShake ws
      GET >=> choose [ path "/" >=> file "index.html"; browseHome]
      NOT_FOUND "Found no handlers." ]


  [<EntryPoint>]
  let main _ =
      startWebServer { defaultConfig with homeFolder = Some @"C:\Users\awball\Documents\projects\suaveWS\src\Site\"; logger = Targets.create Verbose[||]} app
      0 // return an integer exit code