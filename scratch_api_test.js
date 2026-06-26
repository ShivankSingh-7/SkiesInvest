import http from 'http';

const postData = JSON.stringify({
  companyName: 'AMD'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log('SUCCESS! Got response for AMD');
      console.log(`Investment Score: ${parsedData.finalOutput.investmentScore}`);
      console.log(`Risk Score: ${parsedData.finalOutput.riskAnalysis.riskScore}`);
      console.log(`Recommendation: ${parsedData.finalOutput.recommendation}`);
      process.exit(0);
    } catch (e) {
      console.error(e.message);
      console.log('Raw output:');
      console.log(rawData);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
