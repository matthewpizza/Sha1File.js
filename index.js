'use strict';
var sjcl = require('./vendor/sjcl');

/**
 * @param  {File}    file
 * @return {Promise}
 */
function Sha1File(file) {
  return new Promise(function (resolve, reject) {
    var read   = 0;
    var step   = 1024 * 1024;
    var h      = new sjcl.hash.sha1();
    var reader = new FileReader();

    /**
     * @param  {ProgressEvent} evt
     */
    function onLoad(evt) {
      var bits = arrayBufferToBitArray(evt.target.result);
      h.update(bits);

      read += step;

      if (read < file.size) {
        load();
        return;
      }

      var hash = sjcl.codec.hex.fromBits(/*bitArray*/ h.finalize());

      reader.removeEventListener('load', onLoad, false);
      reader = null;
      h = null;
      resolve(hash);
    }

    /**
     * @param  {ArrayBuffer} arrayBuffer
     * @return {Array}       bits
     */
    function arrayBufferToBitArray(arrayBuffer) {
      // Convert ArrayBuffer to Uint8Array.
      var bytes = new Uint8Array(arrayBuffer);

      // Convert from an array of bytes to a bitArray.
      var bits = sjcl.codec.bytes.toBits(bytes);

      return bits;
    }

    function load() {
      reader.readAsArrayBuffer(file.slice(read, read + step));
    }

    reader.addEventListener('load', onLoad, false);
    load();
  });
}

module.exports = Sha1File;
