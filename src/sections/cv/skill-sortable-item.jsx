import PropTypes from 'prop-types';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import SkillItem from './skill-item';

/**
 * Wrapper autour de SkillItem pour le rendre utilisable avec SortableContext
 * Encapsule la logique de tri draggable pour le composant SkillItem
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.skill - Données de la compétence
 * @param {Function} props.onEdit - Fonction appelée pour éditer
 * @param {Function} props.onDelete - Fonction appelée pour supprimer
 */
export default function SkillSortableItem({ skill, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SkillItem
        skill={skill}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

SkillSortableItem.propTypes = {
  skill: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}; 