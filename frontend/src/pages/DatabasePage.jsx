import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import facultyData from '../data/faculty';
import FilterSidebar from '../components/FilterSidebar';
import FacultyTable from '../components/FacultyTable';
import FacultyDrawer from '../components/FacultyDrawer';
import styles from './DatabasePage.module.css';

const defaultFilters = {
  search: '',
  areas: [],
  availableOnly: false,
  degreeTypes: [],
};

const DESIGNATION_RANK = {
  'Professor': 1,
  'Associate Professor & Chairperson': 2,
  'Associate Professor': 3,
  'Assistant Professor': 4,
  'Senior Lecturer': 5,
  'Lecturer': 6,
  'Adjunct Lecturer': 7,
};

function hasResearchInterestMention(faculty) {
  return (
    (Array.isArray(faculty.researchAreas) && faculty.researchAreas.length > 0) ||
    /research interests:/i.test(faculty.bio || '')
  );
}

export default function DatabasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [density, setDensity] = useState('comfortable');
  const [sortConfig, setSortConfig] = useState({ key: 'designation', direction: 'asc' });

  const [filters, setFilters] = useState(() => {
    const area = searchParams.get('area');
    const available = searchParams.get('available');
    return {
      ...defaultFilters,
      areas: area ? [area] : [],
      availableOnly: available === 'true',
    };
  });

  useEffect(() => {
    if (selectedFaculty) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [selectedFaculty]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.areas.length > 0) params.set('area', filters.areas.join(','));
    if (filters.availableOnly) params.set('available', 'true');
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const filtered = useMemo(() => {
    return facultyData.filter((f) => {
      // 1. Search Query
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchable = `${f.name} ${f.initials} ${f.designation} ${f.department} ${f.bio} ${f.researchAreas.join(' ')} ${(f.researchCategories || []).join(' ')} ${f.degreeTypes.join(' ')}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // 2. Research Category Filter
      if (filters.areas.length > 0) {
        if (!filters.areas.some((a) => (f.researchCategories || []).includes(a))) return false;
      }

      // 3. Availability Filter
      if (filters.availableOnly && f.availableSlots === 0) {
        return false;
      }

      // 4. Degree Type Filter
      if (filters.degreeTypes.length > 0 && !filters.degreeTypes.some((d) => f.degreeTypes.includes(d))) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const sortedFaculty = useMemo(() => {
    const items = [...filtered];
    const direction = sortConfig.direction === 'desc' ? -1 : 1;

    items.sort((a, b) => {
      const interestDelta = Number(hasResearchInterestMention(b)) - Number(hasResearchInterestMention(a));
      if (interestDelta !== 0) {
        return interestDelta;
      }

      if (sortConfig.key === 'availability') {
        return (a.availableSlots - b.availableSlots) * direction || a.name.localeCompare(b.name);
      }

      if (sortConfig.key === 'research') {
        return ((a.researchAreas.length || 0) - (b.researchAreas.length || 0)) * direction || a.name.localeCompare(b.name);
      }

      if (sortConfig.key === 'designation') {
        const rankA = getDesignationRank(a.designation);
        const rankB = getDesignationRank(b.designation);
        return (rankA - rankB) * direction || a.name.localeCompare(b.name);
      }

      if (sortConfig.key === 'degree') {
        return (a.degreeTypes.join(', ').localeCompare(b.degreeTypes.join(', ')) * direction) || a.name.localeCompare(b.name);
      }

      return a.name.localeCompare(b.name) * direction;
    });

    return items;
  }, [filtered, sortConfig]);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.areas.length ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.degreeTypes.length ? 1 : 0);

  const clearFilters = () => setFilters(defaultFilters);

  const handleSortChange = (nextKey) => {
    setSortConfig((current) => {
      if (current.key === nextKey) {
        return {
          key: nextKey,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key: nextKey,
        direction: nextKey === 'availability' ? 'desc' : 'asc',
      };
    });
  };

  const exportFaculty = () => {
    const headers = ['Name', 'Position', 'Department', 'Research Areas', 'Availability', 'Degree Types', 'Email'];
    const rows = sortedFaculty.map((faculty) => [
      faculty.name,
      faculty.designation,
      faculty.department,
      faculty.researchAreas.join('; '),
      faculty.availableSlots,
      faculty.degreeTypes.join('; '),
      faculty.email,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortValue = `${sortConfig.key}:${sortConfig.direction}`;

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <FilterSidebar filters={filters} onChange={setFilters} onClear={clearFilters} />

        <section className={styles.content}>
          {/* Toolbar removed per user request */}


          <FacultyTable
            data={sortedFaculty}
            onSelectFaculty={setSelectedFaculty}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            density={density}
          />
        </section>
      </div>

      <FacultyDrawer faculty={selectedFaculty} onClose={() => setSelectedFaculty(null)} />
    </div>
  );
}

function getDesignationRank(designation) {
  return DESIGNATION_RANK[designation] || 999;
}
