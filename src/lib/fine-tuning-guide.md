# Fine-Tuning Guide for Invoice Generator

## Data Preparation

1. **Collect Examples**: Gather at least 100 examples of user prompts and their corresponding ideal invoice outputs

2. **Format Data**: Structure your data as JSON with input/output pairs

3. **Split Data**: Divide into training (80%) and validation (20%) sets

## Fine-Tuning Process

### Using OpenAI API

```javascript
import { OpenAI } from 'openai';

async function fineTuneModel() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 1. Upload the training file
  const file = await openai.files.create({
    file: fs.createReadStream('training_data.jsonl'),
    purpose: 'fine-tune',
  });

  // 2. Create a fine-tuning job
  const fineTuningJob = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: 'gpt-3.5-turbo', // or another base model
  });

  console.log('Fine-tuning job created:', fineTuningJob);

  // 3. Check status periodically
  let jobStatus = await openai.fineTuning.jobs.retrieve(fineTuningJob.id);
  console.log('Status:', jobStatus.status);

  // 4. Once complete, use the fine-tuned model
  // const completion = await openai.chat.completions.create({
  //   model: jobStatus.fine_tuned_model,
  //   messages: [{role: 'user', content: 'Create an invoice for website hosting'}]
  // });
}
```

### Using Claude API

Anthropic's Claude also supports fine-tuning with a similar process.

## Evaluation

1. Test your fine-tuned model with the validation set
2. Calculate metrics like accuracy, precision, and recall
3. Perform qualitative analysis of outputs

## Integration

Update the `nlu.ts` file to use your fine-tuned model instead of the default one.

## Continuous Improvement

1. Collect user feedback on generated invoices
2. Identify patterns in errors or suboptimal outputs
3. Add more examples addressing these issues
4. Re-fine-tune periodically with expanded dataset
