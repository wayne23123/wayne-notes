import { useState, useEffect, useRef } from 'react';

export default function Tools() {
  const [base64, setBase64] = useState('');
  const [svgData, setSvgData] = useState('');
  const [thresholdLow, setThresholdLow] = useState(50);
  const [thresholdHigh, setThresholdHigh] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (base64) {
      handleThreshold();
    }
  }, [base64, thresholdLow, thresholdHigh]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBase64(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleBase64Input(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    setBase64(event.target.value);
  }

  function processImage() {
    setIsProcessing(true);
    console.log(1);
    const img = new Image();
    img.src = base64;
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const grayData = toGrayscale(imageData);
      const edgeData = applyCannyEdgeDetection(
        grayData,
        canvas.width,
        canvas.height,
        thresholdLow,
        thresholdHigh
      );
      const svgString = edgeToSVG(edgeData, canvas.width, canvas.height);
      setSvgData(svgString);

      setIsProcessing(false);
    };
  }

  function handleThreshold() {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
      processImage();
    }, 1000);
  }

  function toGrayscale(imageData: ImageData): Uint8ClampedArray {
    let pixels = imageData.data;
    let grayData = new Uint8ClampedArray(imageData.width * imageData.height);

    for (let i = 0; i < pixels.length; i += 4) {
      let gray =
        pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      grayData[i / 4] = gray;
    }
    return grayData;
  }

  function applyCannyEdgeDetection(
    grayData: Uint8ClampedArray,
    width: number,
    height: number,
    thresholdLow: number,
    thresholdHigh: number
  ): Uint8ClampedArray {
    let sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    let sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    let gradient = new Float32Array(width * height);
    let edgeData = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            let pixel = grayData[(y + i) * width + (x + j)];
            gx += pixel * sobelX[i + 1][j + 1];
            gy += pixel * sobelY[i + 1][j + 1];
          }
        }
        let magnitude = Math.sqrt(gx * gx + gy * gy);
        gradient[y * width + x] = magnitude;
      }
    }

    for (let i = 0; i < gradient.length; i++) {
      edgeData[i] =
        gradient[i] > thresholdHigh
          ? 255
          : gradient[i] > thresholdLow
          ? 128
          : 0;
    }

    return edgeData;
  }

  function edgeToSVG(
    edgeData: Uint8ClampedArray,
    width: number,
    height: number
  ): string {
    let svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n`;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edgeData[y * width + x] === 255) {
          svgString += `  <rect x="${x}" y="${y}" width="1" height="1" fill="black"/>\n`;
        }
      }
    }

    svgString += '</svg>';
    return svgString;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        開發工具 - Base64 轉 SVG
      </h1>

      {/* 圖片上傳 */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="p-2 border rounded w-full md:w-auto"
        />
        <textarea
          rows={3}
          className="p-2 border rounded w-full"
          placeholder="輸入 Base64 圖片數據..."
          value={base64}
          onChange={handleBase64Input}
        />
      </div>

      {/* Canny 閥值控制 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <label className="block">
            低閥值 (Threshold Low): {thresholdLow}
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={thresholdLow}
            onChange={(e) => setThresholdLow(parseInt(e.target.value))}
            className="w-full"
            disabled={isProcessing}
          />
        </div>

        <div className="text-center">
          <label className="block">
            高閥值 (Threshold High): {thresholdHigh}
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={thresholdHigh}
            onChange={(e) => setThresholdHigh(parseInt(e.target.value))}
            className="w-full"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* 轉換後的 SVG */}
      {svgData && (
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-semibold">轉換後的 SVG</h2>
          <div
            dangerouslySetInnerHTML={{ __html: svgData }}
            className="border p-4 mt-2"
          ></div>
          <button
            onClick={() => navigator.clipboard.writeText(svgData)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            複製 SVG 代碼
          </button>
          <pre className="bg-gray-100 p-4 border mt-2 text-left h-28 overflow-auto whitespace-pre-wrap">
            {svgData}
          </pre>
        </div>
      )}
    </div>
  );
}
