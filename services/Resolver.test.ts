// Resolver.test.ts
import { generateResolution } from './Resolver';

const dummyProfile = {
  birth_date: '1990-01-01',
  birth_time: '12:00',
  birth_location: 'NYC',
  tags: ['needs_solitude', 'projector', 'gene_key_6', 'mars_aries', 'split_definition']
};
const dummyFamily = {
  parent_id: 'parent1',
  tags: ['critical', 'triangle']
};
const dummyContext = {
  conflict: 'My dad is criticizing my job.'
};

describe('generateResolution', () => {
  it('should include all modalities in analysis_log', async () => {
    const result = await generateResolution(dummyProfile, dummyFamily, dummyContext);
    expect(result.analysis_log.astrology).toBeDefined();
    expect(result.analysis_log.hd).toBeDefined();
    expect(result.analysis_log.gene_keys).toBeDefined();
    expect(result.analysis_log.channels).toBeDefined();
    expect(result.analysis_log.bowen).toBeDefined();
  });

  it('should use translation matrix for needs_solitude', async () => {
    const result = await generateResolution(dummyProfile, dummyFamily, dummyContext);
    expect(result.root_cause).toContain('overwhelmed');
    expect(result.resolution_script).toContain('alone');
  });
});
