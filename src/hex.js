export const Hex = {
  
    encode (bytes) {

      let hexString = ""
      
      for(let i = 0; i < bytes.length; i++) {
            hexString += bytes[i].toString(16)
      }
  
      return hexString
    },
  
  
    decode (hexString) {
  
      const bytes = []
  
      for(let i = 0; i < hexString.length; i += 2) {
        const byteString = hexString.substring(i, i+2)
        bytes.push(parseInt(byteString, 16))
      }
      
      return bytes
    }
  
}