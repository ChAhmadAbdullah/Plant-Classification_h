const { InferenceClient } =require("@huggingface/inference");

const client = new InferenceClient(process.env.HF_TOKEN);

const data = fs.readFileSync("cats.jpg");

const output = await client.imageClassification({
	data,
	model: "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
	provider: "hf-inference",
});

console.log(output);