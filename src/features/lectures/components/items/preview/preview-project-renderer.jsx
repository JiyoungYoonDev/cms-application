'use client';

import { TiptapDark } from './preview-tiptap';

export function ProjectRenderer({ contentJson }) {
  const parsed = contentJson ?? {};
  const isEditor = parsed.submissionType !== 'REPO';
  const requirements = Array.isArray(parsed.requirements) ? parsed.requirements.filter(Boolean) : [];
  const files = Array.isArray(parsed.files) ? parsed.files : [];

  return (
    <div className='space-y-6'>
      {/* Submission type */}
      <div className='flex items-center gap-2'>
        <span className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72]'>Submission Type</span>
        <span className='text-xs bg-[#1a1a2e] border border-[#2a2a3e] text-[#9090a8] px-2 py-0.5 rounded font-mono font-bold'>
          {parsed.submissionType ?? 'EDITOR'}
        </span>
      </div>

      {/* Description */}
      {parsed.description && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>Description</p>
          <TiptapDark doc={parsed.description} />
        </div>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>Requirements</p>
          <ul className='space-y-1.5'>
            {requirements.map((req, i) => (
              <li key={i} className='flex items-start gap-2 text-sm text-[#c9d1d9]'>
                <span className='text-[#5a5a72] font-mono shrink-0'>{i + 1}.</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editor submission: language + starter files */}
      {isEditor && parsed.language && (
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72]'>Language</span>
          <span className='text-xs font-mono bg-[#1a1a2e] border border-[#2a2a3e] text-[#9090a8] px-2 py-0.5 rounded'>
            {parsed.language}
          </span>
        </div>
      )}

      {isEditor && files.length > 0 && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>
            Starter Files ({files.length})
          </p>
          <div className='space-y-3'>
            {files.map((f, i) => (
              <div key={f.id ?? i} className='rounded-lg overflow-hidden border border-[#2a2a3e]'>
                <div className='px-3 py-1.5 bg-[#0e0e1a] border-b border-[#2a2a3e]'>
                  <span className='text-xs font-mono text-[#9090a8]'>{f.name}</span>
                </div>
                {f.content && (
                  <pre className='bg-[#0d1117] p-3 text-sm font-mono text-[#c9d1d9] whitespace-pre-wrap'>
                    {f.content}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repo submission: field config */}
      {!isEditor && parsed.fields && (
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#5a5a72] mb-2'>Submission Fields</p>
          <ul className='space-y-1 text-sm text-[#c9d1d9]'>
            {parsed.fields.repoRequired && <li>✓ GitHub Repository URL <span className='text-[#5a5a72]'>(required)</span></li>}
            {parsed.fields.demoRequired && <li>✓ Live Demo URL <span className='text-[#5a5a72]'>(required)</span></li>}
            {parsed.fields.snippetRequired && <li>✓ Code Snippet <span className='text-[#5a5a72]'>(required)</span></li>}
            {parsed.fields.noteLabel && <li>✓ Note: <span className='text-[#9090a8] italic'>&quot;{parsed.fields.noteLabel}&quot;</span></li>}
          </ul>
        </div>
      )}
    </div>
  );
}
