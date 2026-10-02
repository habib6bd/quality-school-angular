import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { Notice } from '../models/notice.model';
import { NoticeService } from '../services/notice.service';
import { TeacherService } from '../services/teacher.service';
import {
  ACHIEVEMENT_LIST,
  NOTICE_LIST,
  provideHttpContentRepositories,
  TEACHER_LIST,
} from './content-repositories';
import { HttpContentRepository, LocalContentRepository } from './content-repository';

describe('content repositories', () => {
  it('local repository serves the items it was given', async () => {
    const repo = new LocalContentRepository([1, 2, 3]);
    expect(await firstValueFrom(repo.list())).toEqual([1, 2, 3]);
  });

  it('defaults every collection to the bundled local data', async () => {
    const repo = TestBed.inject(TEACHER_LIST.token);
    expect(repo).toBeInstanceOf(LocalContentRepository);
    expect((await firstValueFrom(repo.list())).length).toBeGreaterThan(0);
    expect(await firstValueFrom(TestBed.inject(ACHIEVEMENT_LIST.token).list())).toEqual([]);
  });

  it('a service reads whatever repository is provided (CMS swap needs no service change)', async () => {
    const remote = { slug: 'remote' } as Notice;
    TestBed.configureTestingModule({
      providers: [{ provide: NOTICE_LIST.token, useValue: { list: () => of([remote]) } }],
    });
    const notices = await firstValueFrom(TestBed.inject(NoticeService).list());
    expect(notices).toEqual([remote]);
  });

  it('services keep their own ordering rules on top of any repository', async () => {
    const make = (slug: string, designation: 'staff' | 'principal') => ({
      slug,
      name: slug,
      designation,
      serial: 0,
      photo: null,
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TEACHER_LIST.token,
          useValue: { list: () => of([make('s', 'staff'), make('p', 'principal')]) },
        },
      ],
    });
    const list = await firstValueFrom(TestBed.inject(TeacherService).list());
    expect(list.map((t) => t.slug)).toEqual(['p', 's']);
  });
});

describe('HttpContentRepository (unwired stub)', () => {
  it('requests GET {baseUrl}/{path} and returns the array', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const repo = new HttpContentRepository<{ id: number }>(
      TestBed.inject(HttpClient),
      'https://api.example.test/v1/',
      'notices',
    );
    const result = firstValueFrom(repo.list());
    const req = http.expectOne('https://api.example.test/v1/notices');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
    http.verify();
    expect(await result).toEqual([{ id: 1 }]);
  });

  it('provideHttpContentRepositories replaces the local repositories', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpContentRepositories('https://api.example.test')],
    });
    expect(TestBed.inject(NOTICE_LIST.token)).toBeInstanceOf(HttpContentRepository);
    expect(TestBed.inject(TEACHER_LIST.token)).toBeInstanceOf(HttpContentRepository);
  });

  it('refuses to be enabled without an API base URL', () => {
    expect(() => provideHttpContentRepositories(null)).toThrowError(/apiBaseUrl/);
  });
});
