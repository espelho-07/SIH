import request from 'supertest';
import app from '../src/app';

describe('Normal Diseases Prediction using Voice AI API Endpoints', () => {
  let patientToken: string;

  beforeAll(async () => {
    const p1Email = `ai_p1_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p1Email,
      password: 'Password123!',
      name: 'AI Test Patient',
    });
    const p1Login = await request(app).post('/api/v1/auth/login').send({
      email: p1Email,
      password: 'Password123!',
    });
    patientToken = p1Login.body.data.accessToken;
  });

  it('POST /api/v1/ai/symptom-analysis - should analyze non-emergency common symptoms', async () => {
    const res = await request(app)
      .post('/api/v1/ai/symptom-analysis')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        symptomsText: 'Mane 2 divas thi fever, cough ane throat pain chhe',
        duration: '2 days',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analysis).toBeDefined();
    expect(res.body.data.analysis.severity).toBe('MODERATE');
    expect(res.body.data.analysis.recommendedSpecialization).toBe('General Physician');
    expect(res.body.data.analysis.possibleConditions.length).toBeGreaterThan(0);
    expect(res.body.data.analysis.recommendation).toContain('healthcare professional');
    expect(res.body.data.analysis.redFlags).toHaveLength(0);
  });

  it('POST /api/v1/ai/symptom-analysis - should detect EMERGENCY red flags (chest pain)', async () => {
    const res = await request(app)
      .post('/api/v1/ai/symptom-analysis')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        symptomsText: 'Severe chest pain and shortness of breath since 1 hour',
        duration: '1 hour',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analysis.severity).toBe('EMERGENCY');
    expect(res.body.data.analysis.redFlags.length).toBeGreaterThan(0);
    expect(res.body.data.analysis.recommendation).toContain('URGENT');
  });

  it('POST /api/v1/ai/symptom-analysis - should reject empty symptoms string', async () => {
    const res = await request(app)
      .post('/api/v1/ai/symptom-analysis')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        symptomsText: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/ai/history - should retrieve patient symptom analysis history', async () => {
    const res = await request(app)
      .get('/api/v1/ai/history')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.history.length).toBe(2);
  });
});
