package sba301.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import sba301.backend.enums.AmenityCategory;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "amenities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Amenity extends BaseEntity {
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "icon", length = 50)
    private String icon;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private AmenityCategory category;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToMany(mappedBy = "amenities")
    @Builder.Default
    private Set<Property> properties = new HashSet<>();
    

}

